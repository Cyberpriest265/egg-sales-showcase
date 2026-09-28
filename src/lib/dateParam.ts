export function parseDateParam(param: string | null): Date | null {
    if (!param || !/^\d{4}-\d{2}-\d{2}$/.test(param)) return null;

    const [y, m, d] = param.split("-").map(Number);
    const date = new Date(y, m - 1, d);

    if (
        date.getFullYear() !== y ||
        date.getMonth() !== m-1 ||
        date.getDate() !== d
    ) return null;

    return date;
} 