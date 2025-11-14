import { atom } from "jotai";
import { type User } from "../api";

export const userAtom = atom<User | null>(null);