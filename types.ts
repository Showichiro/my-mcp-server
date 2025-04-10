import { Tool, Content } from "npm:@modelcontextprotocol/sdk";

export type Module = {
  tool: Tool;
  handler: (args: unknown) => {
    content: Content[];
    isError: boolean;
  };
};
