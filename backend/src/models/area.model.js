import { ObjectId } from "mongodb";

export default class Area {
  constructor({
    _id,
    name,
    currentCapacity,
    maxCapacity,
    staff,
    status,
    note,
  }) {
    this._id = _id ? new ObjectId(_id) : undefined;
    this.name = name;
    this.currentCapacity = currentCapacity ?? 0;
    this.maxCapacity = maxCapacity;
    this.staff = staff ?? [];
    this.status = status ?? "ACTIVE";
    this.note = note ?? "";
  }
}
