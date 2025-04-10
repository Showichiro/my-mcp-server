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
    version: "0.1.0",
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
