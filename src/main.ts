import { App } from '@slack/bolt';
import { WebClient } from '@slack/web-api';
const web = new WebClient(process.env.SLACK_BOT_TOKEN);

// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config();

const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

app.command("/peek", async ({ command, ack, say }) => {
  try {
    await ack();
    const thread_ts = command.thread_ts || command.ts;
    console.log(command)
    console.log(command)
    const result = await web.conversations.replies({
      channel: command.channel_id,
      ts: thread_ts
    });

    if (result.messages && result.messages.length > 0) {
      const message = result.messages.map(msg => msg.text).join("\n");
      console.log(message)
    }


    say("Yaaay! that command works!");
  } catch (error) {
    console.log("err")
    console.error(error);
  }
});


app.shortcut('summarize', async ({ ack, client, body }) => {
  // İsteği onaylayın
  const bodyTemp = body as any;

  try {
    await ack();
    console.log(bodyTemp);

    fetchThreadReplies(bodyTemp.channel.id, bodyTemp.message.thread_ts).then((result) => {
      console.log(result);
    });

    sendEphemeralMessage(bodyTemp.channel.id, bodyTemp.user.id, bodyTemp.message.thread_ts);
  } catch (error) {
    console.log(error)
  }
});

async function fetchThreadReplies(channelId, threadTs) {
  console.log(channelId, threadTs);
  try {
    const result = await web.conversations.replies({
      channel: channelId,
      ts: threadTs
    });

    if (result.ok) {
      return result.messages; // Thread'indeki tüm mesajları döndürür
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error(error);
  }
}

async function sendEphemeralMessage(channelId, userId, thread_ts) {
  try {
    const response = await web.chat.postEphemeral({
      channel: channelId,
      user: userId,
      text: 'Bu mesaj sadece size özeldir!',
      thread_ts: thread_ts,
    });

    if (response.ok) {
      console.log('Ephemeral message sent successfully:', response.ts);
    } else {
      console.error('Error sending ephemeral message:', response.error);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}



(async () => {
  await app.start(process.env.PORT || port);
  console.log(`⚡️ Slack Bolt app is running on port ${port}!`);
})();
