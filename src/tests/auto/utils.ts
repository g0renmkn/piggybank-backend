import { faker } from "@faker-js/faker";

// Generate a valid account object
export function generateValidBankAccount() {
    return {
        name: faker.string.sample({min: 30, max: 30}),
        iban: faker.finance.iban(),
        closed: faker.date.birthdate().toISOString(),
        comments: faker.string.sample({min: 200, max: 200}),
        pfp: faker.string.sample({min: 5, max: 20})
    }
}

// Generate a valid category object
export function generateValidBankCategory() {
    return {
        name: faker.string.sample({min: 30, max: 30}),
        description: faker.string.sample({min: 200, max: 200}),
        icon: faker.string.sample({min: 5, max: 50}),
    }
}
