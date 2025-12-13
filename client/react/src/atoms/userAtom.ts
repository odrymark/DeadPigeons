import { atom } from "jotai";
import { type UserGet } from "../api";

export const userAtom = atom<UserGet | null>(null);