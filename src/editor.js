import { FFmpeg } from '@ffmpeg/ffmpeg';
import coreURL from '@ffmpeg/core?url';
import wasmURL from '@ffmpeg/core/wasm?url';

const $ = (id) => document.getElementById(id);
const clips = [];
const maxBytes = 200 * 1024 * 1024;
let music = null;
let ffmpeg = null;
let busy = false;
let resultURL = null;

function message(text, error = false) {
  $('status').textContent = text;
  $('status').classList.toggle('error', error);
}
function size(bytes) { return `${(bytes / 1024 / 1024).toFixed(1)} МБ`; }
function totalBytes() { return clips.reduce((sum, clip) => sum + clip.file.size, 0) + (music?.size || 0); }
function readDuration(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    const clean = () => { video.removeAttribute('src'); video.load(); URL.revokeObjectURL(url); };
    video.onloadedmetadata = () => {
      const duration = video.duration;
      clean();
      if (Number.isFinite(duration) && duration > 0) resolve(duration);
      else reject(new Error('Не удалось определить длительность видео.'));
    };
    video.onerror = () => { clean(); reject(new Error('Браузер не может открыть это видео. Попробуйте MP4 или WebM.')); };
    video.src = url;
  });
}
function showClips() {
  const container = $('clips');
  container.replaceChildren();
  clips.forEach((clip, index) => {
    const card = document.createElement('div'); card.className = 'clip';
    const top = document.createElement('div'); top.className = 'clip-top';
    const number = document.createElement('div'); number.className = 'clip-number'; number.textContent = String(index + 1).padStart(2, '0');
    const title = document.createElement('div'); title.className = 'clip-title';
    const name = document.createElement('strong'); name.textContent = clip.file.name; name.title = clip.file.name;
    const detail = document.createElement('small'); detail.textContent = `${clip.duration.toFixed(1)} сек · ${size(clip.file.size)}`;
    title.append(name, detail); top.append(number, title);
    const action = (label, symbol, disabled, fn) => {
      const button = document.createElement('button'); button.type = 'button'; button.className = 'icon-btn';
      button.setAttribute('aria-label', label); button.title = label; button.textContent = symbol; button.disabled = disabled;
      button.addEventListener('click', fn); top.append(button);
    };
    action('Переместить выше', '↑', index === 0, () => { [clips[index - 1], clips[index]] = [clips[index], clips[index - 1]]; showClips(); });
    action('Переместить ниже', '↓', index === clips.length - 1, () => { [clips[index + 1], clips[index]] = [clips[index], clips[index + 1]]; showClips(); });
    action('Удалить клип', '×', false, () => { clips.splice(index, 1); showClips(); });
    const trim = document.createElement('div'); trim.className = 'trim';
    const field = (text, key) => {
      const label = document.createElement('label'); label.textContent = text;
      const input = document.createElement('input'); input.type = 'number'; input.min = '0'; input.max = String(clip.duration); input.step = '0.01'; input.value = clip[key]; input.setAttribute('aria-label', `${text}: ${clip.file.name}`);
      input.addEventListener('input', () => { clip[key] = input.value; }); label.append(input); return label;
    };
    const dash = document.createElement('span'); dash.textContent = '—';
    trim.append(field('Начало, сек', 'start'), dash, field('Конец, сек', 'end'));
    card.append(top, trim); container.append(card);
  });
  $('total').textContent = clips.length ? `Клипов: ${clips.length} · ${size(totalBytes())} из 200 МБ` : 'Пока нет добавленных видео';
  $('export').disabled = !clips.length || busy;
  if (!busy) message(clips.length ? 'Настройте отрезки и создайте видео.' : 'Добавьте хотя бы один клип, чтобы начать.');
}
async function addFiles(fileList) {
  if (busy) return;
  const files = Array.from(fileList);
  if (!files.length) return;
  // Include pending files in the check, before loading their metadata.
  if (totalBytes() + files.reduce((sum, file) => sum + file.size, 0) > maxBytes) { message('Общий размер файлов превышает 200 МБ. Выберите файлы поменьше.', true); return; }
  $('clipsControls').disabled = true; $('export').disabled = true;
  let failed = [];
  for (const file of files) {
    if (file.type && !file.type.startsWith('video/')) { failed.push(file.name); continue; }
    try { const duration = await readDuration(file); clips.push({ file, duration, start: '0', end: String(Math.floor(duration * 100) / 100 || duration) }); }
    catch { failed.push(file.name); }
  }
  $('clipsControls').disabled = false;
  showClips();
  if (failed.length) message(`Не удалось открыть: ${failed.join(', ')}. Попробуйте MP4 или WebM.`, true);
}
$('videos').addEventListener('change', async (event) => { const files = event.target.files; await addFiles(files); event.target.value = ''; });
$('chooseVideos').addEventListener('click', () => $('videos').click());
$('chooseMusic').addEventListener('click', () => $('music').click());
const drop = $('drop');
drop.addEventListener('click', (event) => { if (!busy && !event.target.closest('button')) $('videos').click(); });
for (const type of ['dragenter', 'dragover']) drop.addEventListener(type, (event) => { event.preventDefault(); if (!busy) drop.classList.add('drag'); });
for (const type of ['dragleave', 'drop']) drop.addEventListener(type, (event) => { event.preventDefault(); drop.classList.remove('drag'); });
drop.addEventListener('drop', (event) => addFiles(event.dataTransfer.files));
$('music').addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (!file) return;
  if ((file.type && !file.type.startsWith('audio/')) || totalBytes() - (music?.size || 0) + file.size > maxBytes) {
    message('Выберите аудиофайл: общий размер файлов не должен превышать 200 МБ.', true); event.target.value = ''; return;
  }
  music = file; $('audioName').textContent = file.name; $('audioName').title = file.name; $('removeMusic').hidden = false; showClips();
});
$('removeMusic').addEventListener('click', () => { music = null; $('music').value = ''; $('audioName').textContent = 'Не выбрана'; $('removeMusic').hidden = true; showClips(); });

async function getFFmpeg() {
  if (ffmpeg?.loaded) return ffmpeg;
  const instance = new FFmpeg();
  try { await instance.load({ coreURL, wasmURL }); ffmpeg = instance; return instance; }
  catch (error) { instance.terminate(); throw error; }
}
async function run(engine, args) {
  const code = await engine.exec(args);
  if (code !== 0) throw new Error('FFmpeg не смог обработать файл. Попробуйте другой формат видео или аудио.');
}
async function exportVideo() {
  if (busy || !clips.length) return;
  for (const clip of clips) {
    const start = Number(clip.start), end = Number(clip.end);
    if (clip.start === '' || clip.end === '' || !Number.isFinite(start) || !Number.isFinite(end) || start < 0 || end <= start || end > clip.duration + 0.001) {
      message(`Проверьте отрезок «${clip.file.name}»: начало должно быть меньше конца, а конец — не больше длительности.`, true); return;
    }
  }
  busy = true; $('clipsControls').disabled = true; $('settings').disabled = true; $('progress').hidden = false; $('progress').value = 0;
  const created = []; let engine;
  try {
    message('Загружаем видеодвижок. При первом запуске это может занять время…');
    engine = await getFFmpeg();
    const [width, height] = $('format').value.split(':');
    for (let i = 0; i < clips.length; i++) {
      const clip = clips[i];
      const input = `input-${i}`; const probe = `probe-${i}.txt`; const output = `clip-${i}.mp4`;
      created.push(input, probe, output);
      message(`Обрабатываем клип ${i + 1} из ${clips.length}…`);
      await engine.writeFile(input, new Uint8Array(await clip.file.arrayBuffer()));
      // Some FFmpeg.wasm cores return -1 even when ffprobe successfully writes its output.
      // Read the output file instead of interpreting that return value as a failure.
      await engine.ffprobe(['-v', 'error', '-select_streams', 'a:0', '-show_entries', 'stream=codec_type', '-of', 'csv=p=0', input, '-o', probe]);
      const hasAudio = (await engine.readFile(probe, 'utf8')).trim() === 'audio';
      const args = ['-ss', String(Number(clip.start)), '-i', input];
      if (!hasAudio) args.push('-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100');
      args.push('-t', String(Number(clip.end) - Number(clip.start)), '-map', '0:v:0', '-map', hasAudio ? '0:a:0' : '1:a:0',
        '-vf', `scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30,format=yuv420p`,
        '-c:v', 'libx264', '-preset', 'ultrafast', '-c:a', 'aac', '-ar', '44100', '-ac', '2', '-af', 'apad', '-shortest', output);
      await run(engine, args);
      await engine.deleteFile(input);
      await engine.deleteFile(probe);
      $('progress').value = Math.round((i + 1) / (clips.length + 1) * 100);
    }
    message('Соединяем клипы…');
    const list = clips.map((_, i) => `file 'clip-${i}.mp4'`).join('\n');
    created.push('list.txt', 'joined.mp4', 'result.mp4');
    await engine.writeFile('list.txt', new TextEncoder().encode(list));
    await run(engine, ['-f', 'concat', '-safe', '0', '-i', 'list.txt', '-c', 'copy', music ? 'joined.mp4' : 'result.mp4']);
    if (music) {
      message('Добавляем музыку…'); created.push('music-input');
      await engine.writeFile('music-input', new Uint8Array(await music.arrayBuffer()));
      await run(engine, ['-i', 'joined.mp4', '-stream_loop', '-1', '-i', 'music-input', '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy', '-c:a', 'aac', '-shortest', '-movflags', '+faststart', 'result.mp4']);
    }
    const data = await engine.readFile('result.mp4');
    if (resultURL) URL.revokeObjectURL(resultURL);
    resultURL = URL.createObjectURL(new Blob([data], { type: 'video/mp4' }));
    $('resultVideo').src = resultURL; $('download').href = resultURL; $('result').hidden = false; $('progress').value = 100;
    message('Готово! Посмотрите результат и скачайте видео.');
  } catch (error) {
    console.error(error); message(error.message || 'Не удалось обработать видео. Попробуйте файлы меньшего размера.', true);
  } finally {
    if (engine) for (const path of created) { try { await engine.deleteFile(path); } catch { /* A failed step may not have created the file. */ } }
    busy = false; $('clipsControls').disabled = false; $('settings').disabled = false; $('export').disabled = !clips.length;
  }
}
$('export').addEventListener('click', exportVideo);
window.addEventListener('pagehide', () => { if (resultURL) URL.revokeObjectURL(resultURL); });
