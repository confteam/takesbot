import { SessionLayer } from "@puregram/session";
import { Context } from "vm";
import { Session } from "./session";

export type MyContext<ctx extends Context> = ctx & SessionLayer<Session>
