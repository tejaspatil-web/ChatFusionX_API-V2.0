export class CreateGroupDto{
    name: string;
    userId:string;
    description: string;
}

export class JoinGroupDto{
    groupId:string
    userId:string
}

export class GetAllGroupsDto{
    groupIds:string []
}

export class SaveMessageDto{
    userName:string
    groupId:string
    userId:string
    message:string
    time:string
}