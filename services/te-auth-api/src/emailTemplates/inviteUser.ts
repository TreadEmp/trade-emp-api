import { InviteEmailDataDto } from '../dto/invites/inviteEmailDataDto'

export class inviteUserEmail {
    public async getEmailContent(data: InviteEmailDataDto) {
        const { firstName = '', lastName = '', org = '', link = '#' } = data;
        let content = `
        <div> Hi ${firstName} ${lastName},
        </br>
        ${org} would like you to access their account at buyport software. ${org} uses buyport to help manage their business.
        To accept this invitation please use the following link: <a href='${link}'>${link}</a>
        </div>
        `
        return content;

    }

}