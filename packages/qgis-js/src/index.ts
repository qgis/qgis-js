//@ts-ignore (will be defined by vite)
export const QGIS_JS_VERSION: string = __QGIS_JS_VERSION;

export type {
  QgisApi,
  QgisApiAdapter,
  CommonQgisApi,
  InternalQgisApi,
} from "../../../src/api/QgisApi";

export { qgis } from "./loader";
