import { Server } from "npm:@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "npm:@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequest,
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "npm:@modelcontextprotocol/sdk/types.js";
import { GetStringLengthModule } from "./get-string-length.ts";
import { GenerateUUIDsModule } from "./generate-uuids.ts";

const TOOLS: Tool[] = [GetStringLengthModule.tool, GenerateUUIDsModule.tool];
const server = new Server(
  {
    name: "local",
    version: "0.2.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {
        getStringLength: TOOLS[0],
        generateUUIDs: TOOLS[1],
      },
    },
  }
);

server.setRequestHandler(ListResourcesRequestSchema, () => ({
  resources: [],
}));

server.setRequestHandler(ListToolsRequestSchema, () => ({ tools: TOOLS }));
server.setRequestHandler(CallToolRequestSchema, (request: CallToolRequest) => {
  const name = request.params.name;
  const args = request.params.arguments ?? {};
  switch (name) {
    case "getStringLength": {
      return GetStringLengthModule.handler(args);
    }
    case "generateUUIDs": {
      return GenerateUUIDsModule.handler(args);
    }
    default: {
      return {
        content: [
          {
            type: "text",
            text: `Unknown tool: ${name}`,
          },
        ],
        isError: true,
      };
    }
  }
});

await server.connect(new StdioServerTransport());

import { Client } from "npm:@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "npm:@modelcontextprotocol/sdk/inMemory.js";
import { expect } from "jsr:@std/expect";

Deno.test("getStringLength", async () => {
  const client = new Client(
    {
      name: "test client",
      version: "1.0",
    },
    {
      capabilities: {},
    }
  );
  const [clientTransport, serverTransport] =
    InMemoryTransport.createLinkedPair();
  await Promise.all([
    client.connect(clientTransport),
    server.connect(serverTransport),
  ]);
  const result = await client.callTool({
    name: "getStringLength",
    arguments: {
      input: "Hello, world!",
    },
  });
  expect(result).toEqual({
    content: [{ type: "text", text: "13" }],
    isError: false,
  });
});

Deno.test("generateUUIDs", async () => {
  const client = new Client(
    {
      name: "test client",
      version: "1.0",
    },
    {
      capabilities: {},
    }
  );
  const [clientTransport, serverTransport] =
    InMemoryTransport.createLinkedPair();
  await Promise.all([
    client.connect(clientTransport),
    server.connect(serverTransport),
  ]);
  const result = await client.callTool({
    name: "generateUUIDs",
    arguments: {
      count: 10,
    },
  });
  expect(result).toEqual({
    content: [...Array(10).keys()].map(() => {
      return {
        type: "text",
        text: expect.stringMatching(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
        ),
      };
    }),
    isError: false,
  });
});
