import { ready } from '../app.js';
import { reveal } from '../core/motion.js';
import { initHero } from '../sections/hero.js';
import { initManifesto } from '../sections/manifesto.js';
import { initEffects } from '../sections/effects.js';
import { initStory } from '../sections/story.js';
import { initCatalogIndex, initFlagship, initProjects, initVideos, initNews } from '../sections/home-extra.js';
import { initChapterRail } from '../components/chapter-rail.js';

ready(async () => {
  initHero();
  initManifesto();
  initChapterRail();
  const tasks = [initEffects(), initStory(), initCatalogIndex(), initFlagship(), initProjects(), initVideos(), initNews()];
  const results = await Promise.allSettled(tasks);
  results.forEach((r) => r.status === 'rejected' && console.error('[home]', r.reason));
  reveal(); // pick up content rendered from data
});
