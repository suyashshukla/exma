export class AppUser {
    userId!: string;
    displayName!: string;
    email!: string
    deviceId!: string;

    constructor(args:any){
        this.userId = args.userId;
        this.deviceId =  args.deviceId;
        this.displayName = args.displayName || '';
        this.email = args.email || '';
    }
}