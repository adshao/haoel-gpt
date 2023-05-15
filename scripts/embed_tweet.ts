import { Tweet, TweetJSON } from "@/types";
import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import csv from 'csv-parser';
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

  const { data, error } = await supabase.from("pg").insert(rows).select("*");

  if (error) {
    console.log("error", error);
  } else {
    console.log("saved", rows.length);
  }

  await new Promise((resolve) => setTimeout(resolve, 200));
};

let tweets: Tweet[] = [];

(async () => {
  fs.createReadStream('../twint/haoel.csv')
    .pipe(csv())
    .on('data', (row) => {
      // Parse the necessary fields from each row
      let tweet_url = row['url'];
      let tweet_date = row['Date Created'];
      let content = row['Text'];
      let author = 'haoel';

      // Create a new tweet object and add it to the array
      tweets.push({ tweet_url, tweet_date, content, author, embedding: [] });
    })
    .on('end', async () => {
      // Filter tweets
      const filteredTweets = tweets.filter(tweet => new Date(tweet.tweet_date) < new Date('2022-07-15 06:03:13'));
      
      // Generate embeddings
      for (let i = 0; i < filteredTweets.length; i += 100) {
        await generateEmbeddings(filteredTweets.slice(i, i + 100));
      }
    });
})();