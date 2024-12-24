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