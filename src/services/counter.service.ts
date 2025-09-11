import { Models } from "../models/model.registry";

export enum CounterKeys {
    GUEST_ACCOUNT = 'guest-account',
    EMAIL_ACCOUNT = 'email-account'
};

export async function nextCounterSequence(key: string): Promise<number> {
    const doc = await Models.GuestCounter.findOneAndUpdate(
        { key },
        { $inc: { value: 1 } },
        { upsert: true, new: true }
    );
    return doc.value;
}