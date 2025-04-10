import { Module } from "./types.ts";
import { $object, $string } from "@showichiro/validators";

const $param = $object(
  {
    input: $string,
  },
  false
);

export const GetStringLengthModule: Module = {
  tool: {
    name: "getStringLength",
    description: "Get the length of a string",
  },
  handler: (args: unknown) => {
    if ($param(args)) {
      const { input } = args;
      return {
        content: [
          {
            type: "text",
            text: `${Array.from(input).length}`,
          },
        ],
        isError: false,
      };
    } else {
      return {
        content: [
          {
            type: "text",
            text: "Expected input",
          },
        ],
        isError: true,
      };
    }
  },
};
