import { readFileSync } from "fs";
import { join } from "path";
import { Config } from "../types/config";
import * as toml from "toml";

const raw = readFileSync(join(__dirname, "config.toml"), "utf8");
export const config: Config = toml.parse(raw) as Config;
