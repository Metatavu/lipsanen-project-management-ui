// import the original type declarations
import "i18next";
import { resources } from "localization/i18n";

declare module "i18next" {
  // Extend CustomTypeOptions
  interface CustomTypeOptions {
    resources: (typeof resources)["fi"];
  }
}
