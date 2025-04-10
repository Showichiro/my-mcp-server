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

    const validatedArgs = $param(args);

    // Check if validation was successful
    if (typeof validatedArgs !== "boolean") {
      const { count } = validatedArgs as { count: number };

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
