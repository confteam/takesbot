import { SessionLayer } from "@puregram/session";
import { Context } from "puregram/contexts";
import { Session } from "../session";

export type MyContext<C extends Context> = C & SessionLayer<Session>;
