export class User {
    userId!: string;
    deviceId!: string;

    constructor(args:any){
        this.userId = args.userId;
        this.deviceId =  args.deviceId;
    }
}