import { Transform } from 'class-transformer';

/** Aceita `?ids=a,b` e `?ids=a&ids=b`, sempre devolvendo string[]. */
export function ToStringArray() {
  return Transform(({ value }: { value: unknown }) => {
    if (Array.isArray(value)) {
      return value.map(String).filter(Boolean);
    }

    if (typeof value === 'string') {
      return value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
    }

    return value;
  });
}

/** Query string nao tem boolean: aceita `true`/`1` como verdadeiro. */
export function ToBoolean() {
  return Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'boolean') return value;
    if (value === 'true' || value === '1') return true;
    if (value === 'false' || value === '0') return false;
    return value;
  });
}
