/**
 * {
  "_id": "1342",
  "address": "VM-ICICIB",
  "body": "INR 523 debited from your A/C X1234…",
  "date": 1732566104000,
  "date_sent": 1732566100000,
  "type": 1,
  "read": 1,
  "thread_id": 75,
  "service_center": "+919822089088",
  "seen": 1,
  "status": -1,
  "subscription_id": 1
}
 * 
 */

export class SMSEntity {
    _id: string;
    address: string;
    body: string;
    date: number;
    date_sent: number;
    type: number;
    read: number;
    thread_id: number;
    service_center: string;
    seen: number;
    status: number;
    subscription_id: number;

    constructor(data: any) {
        this._id = data._id;
        this.address = data.address;
        this.body = data.body;
        this.date = data.date;
        this.date_sent = data.date_sent;
        this.type = data.type;
        this.read = data.read;
        this.thread_id = data.thread_id;
        this.service_center = data.service_center;
        this.seen = data.seen;
        this.status = data.status;
        this.subscription_id = data.subscription_id;
    }
}