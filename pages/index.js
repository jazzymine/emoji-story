import penguinImg from '../public/penguin.png';

import Head from 'next/head';
import Image from 'next/image';
import { Button, Paper, Alert, Snackbar, LinearProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

import { useState, useEffect, useRef } from 'react';

import emojiList from '../lib/emoji-compact.json';

const EMOJI_LIMIT = 7;

const randomInt = (max, arrLength) => {
  const ints = [];
  while (ints.length < arrLength) {
    const randomInt = Math.floor(Math.random() * max);
    if (!ints.includes(randomInt))
      ints.push(randomInt);
  }
  return ints;
}

export default function Home() {
  const [emojiOptions, setEmojiOptions] = useState([]);
  const [selectedEmojis, setSelectedEmojis] = useState([]);
  const [story, setStory] = useState([]);
  const [maxEmojiError, setMaxEmojiError] = useState(false);
  const [loading, setLoading] = useState(false);

  const storyRef = useRef();

  useEffect(() => {
    refreshEmojis();
  }, []);

  const addEmoji = (idx) => {
    if (selectedEmojis.length < EMOJI_LIMIT) {
      setSelectedEmojis([...selectedEmojis, idx]);
      refreshEmojis();
    } else {
      setMaxEmojiError(true);
    }
  }

  const refreshEmojis = () => {
    setEmojiOptions(randomInt(emojiList.length, 24));
  }

  const handleSubmit = async () => {
    setLoading(true);
    const emojis = selectedEmojis.reduce((prev, curr) => prev + emojiList[curr], '');
    console.log(emojis);
    const res = await fetch('/api/openai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8'
      },
      body: JSON.stringify({
        emojis: emojis
      })
    });
    const data = await res.json();
    setStory(data.result)
    setLoading(false);

    storyRef.current.scrollIntoView();
  }

  return (
    <div className="es">
      <Head>
        <title>Emoji Story</title>
        <meta name="description" content="App for people with dysgraphia that uses GTP-3 to create family friendly stories using Emojis." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Paper elevation={3} className="es__input-section">
        <Paper className="es__selected" elevation={2}>{
          selectedEmojis.map((idx, i) =>
            <span className="emoji es__selected__item" key={`${i}-selected-emoji`}>{emojiList[idx]}</span>
          )}
          <Button className="es__selected__clear-btn" onClick={() => setSelectedEmojis([])} ><CloseIcon /></Button>
        </Paper>
        <div elevation={3} className="es__options-container">
          <div className="es__options">
            {emojiOptions.map((idx, i) => (
              <Button onClick={() => addEmoji(idx)} className="es__options__item" key={`${i}-emoji`}>
                <span className="emoji">{emojiList[idx]}</span>
              </Button>
            ))}
          </div>
        </div>
      </Paper>
      <div className="play-btn-container">
        {(!loading & selectedEmojis.length !== 0) ?
          <div className="penguin-container">
            <Image src={penguinImg} alt={"penguin art"} className="penguin" />
          </div> : ''
        }
        <div className="play-btn">
          <Button
            disabled={loading || selectedEmojis.length === 0}
            sx={{
              bgcolor: "#937474",
              width: "100%",
              borderRadius: "2em",
              '&:hover': {
                bgcolor: "#755959"
              },
            }}
            variant="contained"
            onClick={handleSubmit}><PlayArrowIcon /></Button>
        </div>
      </div>
      {loading && <LinearProgress className="es__loading-bar" />}
      <Paper className={`es__story${story.length === 0 ? ' es__story--hide' : ''}`}>
        <p ref={storyRef} className="story__text">{story}</p>
      </Paper>
      <Snackbar open={maxEmojiError} autoHideDuration={6000} onClose={() => setMaxEmojiError(false)}>
        <Alert severity="error" sx={{ width: '100%' }}>
          Too many Emojis! 😬
        </Alert>
      </Snackbar>
    </div >
  )
}
