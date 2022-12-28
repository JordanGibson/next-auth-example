import { suite } from "@prisma/client";

export function getFetcher<T>(): (
  input: RequestInfo | URL,
  init?: RequestInit
) => Promise<T> {
  return (input: RequestInfo | URL, init?: RequestInit): Promise<T> =>
    fetch(input, init).then((res) => res.json());
}
