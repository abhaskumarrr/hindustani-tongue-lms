import React from 'react';
import { render } from '@testing-library/react';
import { YouTubePlayer } from '../components/YouTubePlayer';

describe('YouTubePlayer', () => {
  it('renders without crashing', () => {
    render(<YouTubePlayer videoId="test" courseId="test" lessonId="test" />);
  });
});
