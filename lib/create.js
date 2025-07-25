import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import { randomUUID } from "crypto";

export default async function createCmd() {
  const { name } = await inquirer.prompt([
    {
      type: "input",
      name: "name",
      message: "Enter the integration name:",
    },
  ]);

  const folderName = name.trim();
  const className = folderName;
  const integrationId =
    folderName.charAt(0).toLowerCase() + folderName.slice(1);

  const targetDir = path.join(process.cwd(), folderName);
  const logosDir = path.join(targetDir, "logos");

  fs.mkdirSync(targetDir, { recursive: true });
  fs.mkdirSync(logosDir, { recursive: true });

  const jsPath = path.join(targetDir, `${className}.action.js`);
  const jsonPath = path.join(targetDir, `${className}.action.json`);

  const jsTemplate = `export class ${className} {
  spec = {
    uuid: "${randomUUID()}",
    group: [],
    displayName: "${className}",
    name: "${integrationId}",
    logo: "logos/${integrationId}.svg",
    description: "Integrate with ${className}",
    properties: [
      {
        fieldType: "select",
        fieldUuid: "${randomUUID()}",
        fieldMeta: {
          fieldDataTypes: ["string"],
          label: "Operation",
          identifier: "operation",
          defaultValue: "option1",
          explanation: "The operation to perform.",
          mandatory: true,
        },
        choices: [
          {
            label: "Option 1",
            value: "option1",
            choiceUuid: "${randomUUID()}",
          },
          {
            label: "Option 2",
            value: "option2",
            choiceUuid: "${randomUUID()}",
          },
        ],
      },
      {
        fieldType: "text",
        fieldUuid: "${randomUUID()}",
        fieldMeta: {
          fieldDataTypes: ["string"],
          label: "Example Text",
          identifier: "example_text",
          defaultValue: "example",
          explanation: "Explanation for the field",
          mandatory: true
        },
        conditions: {
          visibility: {
            visibleWhenIdentifiersEqualAnyOf: {
              // add condition to display this field conditionally
              operation: [""],
            },
          },
        },
      },
      {
        fieldType: "numeric",
        fieldUuid: "${randomUUID()}",
        fieldMeta: {
          fieldDataTypes: ["string", "number"],
          label: "Example Number",
          identifier: "example_number",
          defaultValue: 1,
          explanation: "Explanation for the field",
          mandatory: false
        },
        conditions: {
          visibility: {
            visibleWhenIdentifiersEqualAnyOf: {
              // add condition to display this field conditionally
              operation: [""],
            },
          },
        },
      },
      {
        fieldType: "boolean",
        fieldUuid: "${randomUUID()}",
        fieldMeta: {
          fieldDataTypes: ["string", "boolean"],
          label: "Example Boolean",
          identifier: "example_boolean",
          defaultValue: true,
          explanation: "Explanation for the field",
          mandatory: false
        },
        conditions: {
          visibility: {
            visibleWhenIdentifiersEqualAnyOf: {
              // add condition to display this field conditionally
              operation: [""],
            },
          },
        },
      },
      {
        fieldType: "fixedGroup",
        fieldUuid: "${randomUUID()}",
        fieldMeta: {
          fieldDataTypes: ["object"],
          label: "Example FixedGroup",
          identifier: "example_fixedgroup",
          defaultValue: {},
          explanation: "Explanation for the field",
          mandatory: false,
        },
        multiInput: {
          label: "Add",
        },
        fixedGroups: [
          {
            fieldUuid: "${randomUUID()}",
            fieldMeta: {
              label: "Data",
              identifier: "data",
            },
            groupedFields: [
              {
                fieldType: "text",
                fieldUuid: "${randomUUID()}",
                fieldMeta: {
                  fieldDataTypes: ["string"],
                  label: "Key",
                  identifier: "key",
                  defaultValue: "",
                  explanation: "Key of the text.",
                  mandatory: true,
                },
              },
              {
                fieldType: "text",
                fieldUuid: "${randomUUID()}",
                fieldMeta: {
                  fieldDataTypes: ["string"],
                  label: "Value",
                  identifier: "value",
                  defaultValue: "",
                  explanation: "value of the text",
                  mandatory: true,
                },
              },
            ],
          },
        ],
        conditions: {
          visibility: {
            visibleWhenIdentifiersEqualAnyOf: {
              // add condition to display this field conditionally
              operation: [""],
            },
          },
        },
      },
    ]
  };

  async execute() {
    const items = this.getInputData();
    const returnData = [];
    const length = items.length;
    for (let i = 0; i < length; i++) {
      try {
        // To generate field parameters run: centiloquy-cli generate ${folderName}/${className}.action.js
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({ error: error.message });
          continue;
        }
        throw error;
      }
    }
    return [this.helpers.formatOutputData(returnData)];
  }
}
`;

  const jsonTemplate = {
    integration: integrationId,
    version: "1.0",
    categories: ["Development & Cloud"],
    resources: {
      credentialDocumentation: [
        {
          url: `/documentation/credentials/${integrationId}`,
        },
      ],
    },
  };

  fs.writeFileSync(jsPath, jsTemplate, "utf8");
  fs.writeFileSync(jsonPath, JSON.stringify(jsonTemplate, null, 2), "utf8");

  console.log(`Created integration folder: ${targetDir}`);
}
