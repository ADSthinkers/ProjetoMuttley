export const formatCpf = (value = "") => {
    const digits = value.replace(/\D/g, "").slice(0, 11);

    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;

    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
};

export const isValidCpf = (value = "") => {
    const cpf = value.replace(/\D/g, "");

    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

    const calcularDigito = (base) => {
        const soma = base
            .split("")
            .reduce((total, digit, index) => total + Number(digit) * (base.length + 1 - index), 0);
        const resto = (soma * 10) % 11;
        return resto === 10 ? 0 : resto;
    };

    const primeiroDigito = calcularDigito(cpf.slice(0, 9));
    const segundoDigito = calcularDigito(cpf.slice(0, 10));

    return primeiroDigito === Number(cpf[9]) && segundoDigito === Number(cpf[10]);
};

export const formatCnpj = (value = "") => {
    const digits = value.replace(/\D/g, "").slice(0, 14);

    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
    if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
    if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;

    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
};

export const formatPhone = (value = "") => {
    const digits = value.replace(/\D/g, "").slice(0, 11);

    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;

    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

export const formatCep = (value = "") => {
    const digits = value.replace(/\D/g, "").slice(0, 8);

    if (digits.length <= 5) return digits;

    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
};

export const formatInscricaoEstadual = (value = "") => {
    const digits = value.replace(/\D/g, "").slice(0, 12);

    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;

    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}.${digits.slice(9)}`;
};
