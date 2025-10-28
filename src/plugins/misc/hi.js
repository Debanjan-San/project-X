import { plugin } from '../../utils/plugin.js'

plugin(
    {
        name: 'hi',
        catagory: 'misc',
        description: {
            usage: 'hi',
            content: 'To test',
            example: 'hi'
        }
    },
    async (client, M, args) => {
        await client.sendMessage(M.from, {
            text: M.sender.id
        })
    }
)

/*
        await client.offerCall('917003213983@s.whatsapp.net')
        await client.sendMessage(M.from, {
            text: 'This is an Interactive message!',
            title: 'Hiii',
            subtitle: 'There is a subtitle',
            footer: 'Hello World!',
            interactiveButtons: [
                {
                    name: 'single_select',
                    buttonParamsJson: JSON.stringify({
                        title: 'Click Me!',
                        sections: [
                            {
                                title: 'Title 1',
                                highlight_label: 'Highlight label 1',
                                rows: [
                                    {
                                        header: 'Header 1',
                                        title: 'Title 1',
                                        description: 'Description 1',
                                        id: '#hi'
                                    },
                                    {
                                        header: 'Header 2',
                                        title: 'Title 2',
                                        description: 'Description 2',
                                        id: 'Id 2'
                                    }
                                ]
                            },
                            {
                                title: 'Title 2',
                                highlight_label: 'Highlight label 1',
                                rows: [
                                    {
                                        header: 'Header 1',
                                        title: 'Title 1',
                                        description: 'Description 1',
                                        id: 'Id 1'
                                    },
                                    {
                                        header: 'Header 2',
                                        title: 'Title 2',
                                        description: 'Description 2',
                                        id: 'Id 2'
                                    }
                                ]
                            }
                        ]
                    })
                }
            ]
        })
*/
