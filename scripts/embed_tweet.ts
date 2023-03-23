import { Tweet, TweetJSON } from "@/types";
import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import { Configuration, OpenAIApi } from "openai";

loadEnvConfig("");

const generateEmbeddings = async (tweets: Tweet[]) => {
  const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
  const openai = new OpenAIApi(configuration);

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  const rows = await Promise.all(tweets.map(async (tweet) => {
    const { tweet_url, tweet_date, content, author } = tweet;

    const embeddingResponse = await openai.createEmbedding({
      model: "text-embedding-ada-002",
      input: content
    });

    const [{ embedding }] = embeddingResponse.data.data;

    return {
      tweet_url: tweet_url,
      tweet_date: tweet_date.split(' ')[0] + ' ' + tweet_date.split(' ')[1],
      content: content,
      author: author,
      embedding: embedding
    };
  }));

  const { data, error } = await supabase.from("tweetai").insert(rows).select("*");

  if (error) {
    console.log("error", error);
  } else {
    console.log("saved", rows.length);
  }

  await new Promise((resolve) => setTimeout(resolve, 200));
};

(async () => {
  const tweetsJSON: TweetJSON = JSON.parse(fs.readFileSync("/Users/adam/Work/twint/VitalikButerin.json", "utf8"));

const tweets = tweetsJSON.tweets.filter(tweet => new Date(tweet.tweet_date) < new Date('2019-12-25 21:20:58'));
for (let i = 0; i < tweets.length; i += 100) {
  await generateEmbeddings(tweets.slice(i, i + 100));
}
})();

