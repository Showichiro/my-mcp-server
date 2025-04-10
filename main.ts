import { Server } from "npm:@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "npm:@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  CallToolRequest,
  Tool,
} from "npm:@modelcontextprotocol/sdk/types.js";
import { GetStringLengthModule } from "./get-string-length.ts";

const TOOLS: Tool[] = [GetStringLengthModule.tool];
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
