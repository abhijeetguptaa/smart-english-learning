import React from 'react';
import VideoPlayer from './VideoPlayer';
import { STORIES_VIDEOS } from '../data/rhymeData';

const VideoStories: React.FC = () => {
  return <VideoPlayer videos={STORIES_VIDEOS} />;
};

export default VideoStories;
