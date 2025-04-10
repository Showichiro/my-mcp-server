import { Module } from "./types.ts";
import { $number, $object } from "@showichiro/validators";

export const GenerateUUIDsModule: Module = {
  tool: {
    name: "generateUUIDs",
    description: "Generate a specified number of UUIDs",
  },
  handler: (args: unknown) => {
    const $param = $object(
      {
        count: $number,
      },
      false
    );

    if ($param(args)) {
      const { count } = args;

      const uuids = Array.from({ length: count }, () => crypto.randomUUID());

      return {
        content: uuids.map((uuid) => ({ type: "text", text: uuid })),
        isError: false,
      };
    } else {
      return {
        content: [{ type: "text", text: "Invalid input" }],
        isError: true,
      };
    }
  },
};
