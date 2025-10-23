// HIVE 8-bit — Overworld + Turtle (Shield) + Rabbit (Sword) + Owl (Compass)
// 640x480 + touch controls + local save + fog-of-war

// ---------- HUD + Save ----------
const hud = {
  shards:  document.getElementById('shards'),
  cycles:  document.getElementById('cycles'),
  path:    document.getElementById('path'),
  shield:  document.getElementById('shield'),
  sword:   document.getElementById('sword'),
  compass: document.getElementById('compass'),
  modal:   document.getElementById('modal'),
  btnPure: document.getElementById('choose-pure'),
  btnHaste:document.getElementById('choose-haste')
};

let state = {
  shards:0, cycles:0, path:null,
  hasShield:false, hasSword:false, hasCompass:false,
  lastScene:'overworld'
};

const save = () => localStorage.setItem('hive_save', JSON.stringify(state));
const load = () => {
  try { Object.assign(state, JSON.parse(localStorage.getItem('hive_save')||'{}')); } catch(e){}
  hud.shards.textContent = state.shards;
  hud.cycles.textContent = state.cycles;
  hud.path.textContent   = state.path || '—';
  if (hud.shield)  hud.shield.textContent  = state.hasShield  ? '✓' : '—';
  if (hud.sword)   hud.sword.textContent   = state.hasSword   ? '✓' : '—';
  if (hud.compass) hud.compass.textContent = state.hasCompass ? '✓' : '—';
};
load();

hud.btnPure.onclick  = () => { state.path='Pure';  hud.path.textContent='Pure';  hud.modal.style.display='none'; save(); };
hud.btnHaste.onclick = () => { state.path='Haste'; hud.path.textContent='Haste'; hud.modal.style.display='none'; save(); };

// ---------- Phaser Config ----------
const config = {
  type: Phaser.AUTO,
  width: 640, height: 480, pixelArt: true,
  backgroundColor: '#0b0d10',
  physics: { default:'arcade', arcade:{ gravity:{y:0}, debug:false } },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [OverworldScene, TurtleShrineScene, RabbitShrineScene, OwlShrineScene]
};
new Phaser.Game(config);

// ---------- Helpers ----------
function drawCheckerboard(scene, wTiles=40, hTiles=30) {
  const g = scene.add.graphics();
  for (let i=0;i<wTiles;i++) for (let j=0;j<hTiles;j++) {
    const tone = ((i+j)%2===0) ? 0x12161b : 0x0f1318;
    g.fillStyle(tone,1).fillRect(i*16, j*16, 16, 16);
  }
}

function makePortal(scene, x,y, labelText){
  const ring = scene.add.circle(x,y,12,0x4ad9c6,0.25).setStrokeStyle(2,0x4ad9c6);
  scene.tweens.add({ targets:ring, scale:1.1, duration:700, yoyo:true, repeat:-1 });
  const label = scene.add.text(x-28,y-24,labelText,{fontFamily:'system-ui',fontSize:'10px',color:'#bfecee'}).setAlpha(0.75);
  return { ring, label };
}

function dirInput(scene){
  const t = (window.touchDir)||{left:false,right:false,up:false,down:false};
  const c = scene.cursors;
  return {
    left:  c.left.isDown  || t.left,
    right: c.right.isDown || t.right,
    up:    c.up.isDown    || t.up,
    down:  c.down.isDown  || t.down
  };
}

// ---------- Overworld ----------
function OverworldScene(){ Phaser.Scene.call(this,{key:'overworld'}); }
OverworldScene.prototype = Object.create(Phaser.Scene.prototype);
OverworldScene.prototype.constructor = OverworldScene;

OverworldScene.prototype.preload = function(){
  this.load.image('player','assets/player.svg');
  this.load.image('shard','assets/shard.svg');
  this.load.image('shield','assets/shield.svg');
  this.load.image('sword','assets/sword.svg');
  this.load.image('compass','assets/compass.svg');
};

OverworldScene.prototype.create = function(){
  drawCheckerboard(this);
  this.player = this.physics.add.image(320,240,'player').setCollideWorldBounds(true);
  this.cursors = this.input.keyboard.createCursorKeys();
  this.keyE    = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

  // remaining shards
  this.shardsGroup = this.physics.add.staticGroup();
  const toSpawn = Math.max(0, 7 - state.shards);
  for(let i=0;i<toSpawn;i++){
    const x = Phaser.Math.Snap.To(Phaser.Math.Between(24, 640-24), 16);
    const y = Phaser.Math.Snap.To(Phaser.Math.Between(24, 480-24), 16);
    this.shardsGroup.create(x,y,'shard');
  }
  this.physics.add.overlap(this.player, this.shardsGroup, (_p, s)=>{
    s.destroy(); state.shards++; hud.shards.textContent=state.shards; save();
    if(state.shards===1 && !state.path){ hud.modal.style.display='flex'; }
  });

  // portals
  this.turtlePortal = makePortal(this, 600, 440, 'E: Turtle Shrine');
  this.rabbitPortal = makePortal(this,  40, 440, 'E: Rabbit Shrine');
  this.owlPortal    = makePortal(this, 320,  32, 'E: Owl Shrine');

  // HUD refresh
  if (hud.shield)  hud.shield.textContent  = state.hasShield  ? '✓' : '—';
  if (hud.sword)   hud.sword.textContent   = state.hasSword   ? '✓' : '—';
  if (hud.compass) hud.compass.textContent = state.hasCompass ? '✓' : '—';

  // cycles
  this.time.addEvent({
    delay:5000, loop:true, callback:()=>{
      state.cycles++; hud.cycles.textContent=state.cycles; save();
      if(state.path==='Pure'  && state.cycles===300) alert('Pure KYC unlocked (full reveal).');
      if(state.path==='Haste' && state.cycles===500) alert('Haste rite reached (80% reveal + 20% burn).');
    }
  });
};

OverworldScene.prototype.update = function(){
  const v=140; const d = dirInput(this);
  this.player.setVelocity(0);
  if(d.left && !d.right)  this.player.setVelocityX(-v);
  else if(d.right && !d.left) this.player.setVelocityX(v);
  if(d.up && !d.down)     this.player.setVelocityY(-v);
  else if(d.down && !d.up)    this.player.setVelocityY(v);

  if (Phaser.Math.Distance.Between(this.player.x,this.player.y,600,440) < 24 && Phaser.Input.Keyboard.JustDown(this.keyE)){
    state.lastScene='overworld'; save(); this.scene.start('turtle');
  }
  if (Phaser.Math.Distance.Between(this.player.x,this.player.y,40,440) < 24 && Phaser.Input.Keyboard.JustDown(this.keyE)){
    state.lastScene='overworld'; save(); this.scene.start('rabbit');
  }
  if (Phaser.Math.Distance.Between(this.player.x,this.player.y,320,32) < 24 && Phaser.Input.Keyboard.JustDown(this.keyE)){
    state.lastScene='overworld'; save(); this.scene.start('owl');
  }
};

// ---------- Turtle Shrine (Shield) ----------
function TurtleShrineScene(){ Phaser.Scene.call(this,{key:'turtle'}); }
TurtleShrineScene.prototype = Object.create(Phaser.Scene.prototype);
TurtleShrineScene.prototype.constructor = TurtleShrineScene;

TurtleShrineScene.prototype.preload = function(){
  this.load.image('player','assets/player.svg');
  this.load.image('shield','assets/shield.svg');
};

TurtleShrineScene.prototype.create = function(){
  drawCheckerboard(this);
  this.add.text(12,10,'Turtle Shrine — Virtue',{fontFamily:'system-ui',fontSize:'12px',color:'#bfecee'});
  this.exit = makePortal(this, 32, 448, 'E: Exit');
  this.player = this.physics.add.image(48,440,'player').setCollideWorldBounds(true);
  this.cursors = this.input.keyboard.createCursorKeys();
  this.keyE    = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

  const glow = this.add.rectangle(320, 240, 16,16, 0x2ecc71, 0.35).setStrokeStyle(1,0x2ecc71);
  this.block = this.physics.add.image(400, 240, null).setDisplaySize(16,16).setTint(0x557a57);
  this.block.body.setCollideWorldBounds(true).setImmovable(false).setDrag(500,500).setMaxVelocity(160,160);
  this.chest = this.add.rectangle(320, 200, 16,12, 0xd4af37).setStrokeStyle(1,0x8a6e1a).setVisible(false);
  this.chestHint = this.add.text(300,182,'E: Claim Shield',{fontFamily:'system-ui',fontSize:'10px',color:'#e9e1c7'}).setVisible(false);

  this.solved = false;
  this.time.addEvent({ delay:100, loop:true, callback:()=>{
    const onTarget = Phaser.Math.Distance.Between(this.block.x,this.block.y,glow.x,glow.y) < 8;
    if(onTarget && !this.solved){ this.solved=true; this.chest.setVisible(true); this.chestHint.setVisible(true); }
  }});
};

TurtleShrineScene.prototype.update = function(){
  const v=140; const d = dirInput(this);
  this.player.setVelocity(0);
  if(d.left && !d.right) this.player.setVelocityX(-v);
  else if(d.right && !d.left) this.player.setVelocityX(v);
  if(d.up && !d.down) this.player.setVelocityY(-v);
  else if(d.down && !d.up) this.player.setVelocityY(v);

  // push block when close
  if (Phaser.Math.Distance.Between(this.player.x,this.player.y,this.block.x,this.block.y) < 20){
    this.block.body.velocity.x += (this.player.body.velocity.x||0)*0.6;
    this.block.body.velocity.y += (this.player.body.velocity.y||0)*0.6;
  }

  if (Phaser.Math.Distance.Between(this.player.x,this.player.y,32,448) < 24 && Phaser.Input.Keyboard.JustDown(this.keyE)){
    this.scene.start('overworld');
  }
  if (this.solved &&
      Phaser.Math.Distance.Between(this.player.x,this.player.y,this.chest.x,this.chest.y) < 20 &&
      Phaser.Input.Keyboard.JustDown(this.keyE)){
    if (!state.hasShield){
      state.hasShield = true; save();
      if (hud.shield) hud.shield.textContent = '✓';
      alert('Shield of Virtue acquired!');
    }
  }
};

// ---------- Rabbit Shrine (Sword) ----------
function RabbitShrineScene(){ Phaser.Scene.call(this,{key:'rabbit'}); }
RabbitShrineScene.prototype = Object.create(Phaser.Scene.prototype);
RabbitShrineScene.prototype.constructor = RabbitShrineScene;

RabbitShrineScene.prototype.preload = function(){
  this.load.image('player','assets/player.svg');
  this.load.image('sword','assets/sword.svg');
};

RabbitShrineScene.prototype.create = function(){
  drawCheckerboard(this);
  this.add.text(12,10,'Rabbit Shrine — Love (Timed Trial)',{fontFamily:'system-ui',fontSize:'12px',color:'#bfecee'});
  this.exit = makePortal(this, 608, 448, 'E: Exit');
  this.player = this.physics.add.image(600,440,'player').setCollideWorldBounds(true);
  this.cursors = this.input.keyboard.createCursorKeys();
  this.keyE    = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

  const mk = (x,y)=> this.add.rectangle(x,y,14,14,0xff66aa,0.35).setStrokeStyle(1,0xff66aa);
  this.beacons = [ mk(80,80), mk(560,120), mk(320,260) ];
  this.hit = [false,false,false];

  this.timeLeft = 20;
  this.timerText = this.add.text(540,10,`Time: ${this.timeLeft}s`,{fontFamily:'system-ui',fontSize:'12px',color:'#ffd4e6'});
  this.timeEvt = this.time.addEvent({ delay:1000, loop:true, callback:()=>{
    this.timeLeft--; this.timerText.setText(`Time: ${this.timeLeft}s`);
    if (this.timeLeft<=0 && !this.chest){ this.fail(); }
  }});

  this.chest = null; this.hint  = null;
};

RabbitShrineScene.prototype.update = function(){
  const v=160; const d = dirInput(this);
  this.player.setVelocity(0);
  if(d.left && !d.right)  this.player.setVelocityX(-v);
  else if(d.right && !d.left) this.player.setVelocityX(v);
  if(d.up && !d.down)     this.player.setVelocityY(-v);
  else if(d.down && !d.up)    this.player.setVelocityY(v);

  if (Phaser.Math.Distance.Between(this.player.x,this.player.y,608,448) < 24 && Phaser.Input.Keyboard.JustDown(this.keyE)){
    this.scene.start('overworld');
  }

  this.beacons.forEach((b,i)=>{
    if(!this.hit[i] && Phaser.Math.Distance.Between(this.player.x,this.player.y,b.x,b.y) < 14){
      this.hit[i]=true; b.setFillStyle(0x66ffcc,0.4).setStrokeStyle(1,0x66ffcc);
    }
  });

  if (!this.chest && this.hit.every(Boolean)){
    this.chest = this.add.rectangle(320, 200, 16,12, 0xd4af37).setStrokeStyle(1,0x8a6e1a);
    this.hint  = this.add.text(300,182,'E: Claim Sword',{fontFamily:'system-ui',fontSize:'10px',color:'#e9e1c7'});
  }

  if (this.chest &&
      Phaser.Math.Distance.Between(this.player.x,this.player.y,this.chest.x,this.chest.y) < 20 &&
      Phaser.Input.Keyboard.JustDown(this.keyE)){
    if (!state.hasSword){
      state.hasSword = true; save();
      if (hud.sword) hud.sword.textContent = '✓';
      alert('Sword of Compassion acquired!');
    }
  }
};

RabbitShrineScene.prototype.fail = function(){
  this.timeLeft = 20; this.hit = [false,false,false];
  this.beacons.forEach(b=> b.setFillStyle(0xff66aa,0.35).setStrokeStyle(1,0xff66aa));
  if (this.chest){ this.chest.destroy(); this.chest=null; }
  if (this.hint){ this.hint.destroy(); this.hint=null; }
  this.timerText.setText(`Time: ${this.timeLeft}s`);
};

// ---------- Owl Shrine (Compass / Fog-of-War) ----------
function OwlShrineScene(){ Phaser.Scene.call(this,{key:'owl'}); }
OwlShrineScene.prototype = Object.create(Phaser.Scene.prototype);
OwlShrineScene.prototype.constructor = OwlShrineScene;

OwlShrineScene.prototype.preload = function(){
  this.load.image('player','assets/player.svg');
  this.load.image('compass','assets/compass.svg');
};

OwlShrineScene.prototype.create = function(){
  // crude maze walls
  const g = this.add.graphics();
  g.fillStyle(0x0f1318,1).fillRect(0,0,640,480);
  const wall = this.add.graphics({fillStyle:{color:0x12161b}});
  const rects = [
    [16,16,608,16],[16,448,608,16],[16,16,16,448],[608,16,16,448], // border
    [120,80,400,16],[120,80,16,280],[120,344,320,16],[424,120,16,240],
    [200,160,250,16],[200,160,16,180],[216,324,220,16],[300,200,16,124],
  ];
  rects.forEach(([x,y,w,h])=> wall.fillRect(x,y,w,h));

  // player & input
  this.player = this.physics.add.image(40,440,'player').setCollideWorldBounds(true);
  this.cursors = this.input.keyboard.createCursorKeys();
  this.keyE    = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

  // fog-of-war mask
  this.fog = this.make.graphics({x:0,y:0, add:false});
  this.fog.fillStyle(0x000000, 0.85);
  this.maskTex = this.fog.createGeometryMask();
  this.maskTex.setInvertAlpha(true);
  wall.setMask(this.maskTex); // walls sit under fog; mask defines visible hole
  // also dim the background under fog
  g.setMask(this.maskTex);

  // pedestal (goal)
  this.pedestal = this.add.circle(600, 40, 8, 0x90caf9, 0.9);
  this.pedestalLabel = this.add.text(576,52,'E: Insight',{fontFamily:'system-ui',fontSize:'10px',color:'#bfecee'}).setAlpha(0.85);

  // exit portal (unmasked hint if compass is owned later)
  this.exit = this.add.text(300,456,'E: Exit →',{fontFamily:'system-ui',fontSize:'10px',color:'#bfecee'}).setAlpha(0.4);

  // vision radius (bigger if you already have Compass)
  this.vision = state.hasCompass ? 80 : 48;

  // timer glow pulse
  this.t = 0;
};

OwlShrineScene.prototype.update = function(){
  const v=140; const d = dirInput(this);
  this.player.setVelocity(0);
  if(d.left && !d.right)  this.player.setVelocityX(-v);
  else if(d.right && !d.left) this.player.setVelocityX(v);
  if(d.up && !d.down)     this.player.setVelocityY(-v);
  else if(d.down && !d.up)    this.player.setVelocityY(v);

  // update fog hole
  this.t += 0.02;
  const flicker = Math.sin(this.t)*2;
  this.fog.clear();
  this.fog.fillStyle(0x000000, 0.93);
  this.fog.fillRect(0,0,640,480);
  this.fog.fillStyle(0xffffff, 1);
  this.fog.beginPath();
  this.fog.arc(this.player.x, this.player.y, this.vision + flicker, 0, Math.PI*2);
  this.fog.fill();

  // exit back
  if (Phaser.Math.Distance.Between(this.player.x,this.player.y,320,464) < 20 &&
      Phaser.Input.Keyboard.JustDown(this.keyE)){
    this.scene.start('overworld');
  }

  // claim compass at pedestal
  if (Phaser.Math.Distance.Between(this.player.x,this.player.y,600,40) < 18 &&
      Phaser.Input.Keyboard.JustDown(this.keyE)){
    if (!state.hasCompass){
      state.hasCompass = true; save();
      if (hud.compass) hud.compass.textContent = '✓';
      alert('Compass of Insight acquired!');
      // widen vision immediately
      this.vision = 80;
      // make exit hint brighter now that you “see”
      this.exit.setAlpha(0.9);
    }
  }
};
// ---------- Phaser Config ----------
const config = {
  type: Phaser.AUTO,
  width: 640, height: 480, pixelArt: true,
  backgroundColor: '#0b0d10',
  physics: { default:'arcade', arcade:{ gravity:{y:0}, debug:false } },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [OverworldScene, TurtleShrineScene, RabbitShrineScene, OwlShrineScene]
};
new Phaser.Game(config);

// ---------- Helpers ----------
function drawCheckerboard(scene, wTiles=40, hTiles=30) {
  const g = scene.add.graphics();
  for (let i=0;i<wTiles;i++) for (let j=0;j<hTiles;j++) {
    const tone = ((i+j)%2===0) ? 0x12161b : 0x0f1318;
    g.fillStyle(tone,1).fillRect(i*16, j*16, 16, 16);
  }
}

function makePortal(scene, x,y, labelText){
  const ring = scene.add.circle(x,y,12,0x4ad9c6,0.25).setStrokeStyle(2,0x4ad9c6);
  scene.tweens.add({ targets:ring, scale:1.1, duration:700, yoyo:true, repeat:-1 });
  const label = scene.add.text(x-28,y-24,labelText,{fontFamily:'system-ui',fontSize:'10px',color:'#bfecee'}).setAlpha(0.75);
  return { ring, label };
}

function dirInput(scene){
  const t = (window.touchDir)||{left:false,right:false,up:false,down:false};
  const c = scene.cursors;
  return {
    left:  c.left.isDown  || t.left,
    right: c.right.isDown || t.right,
    up:    c.up.isDown    || t.up,
    down:  c.down.isDown  || t.down
  };
}

// ---------- Overworld ----------
function OverworldScene(){ Phaser.Scene.call(this,{key:'overworld'}); }
OverworldScene.prototype = Object.create(Phaser.Scene.prototype);
OverworldScene.prototype.constructor = OverworldScene;

OverworldScene.prototype.preload = function(){
  this.load.image('player','assets/player.svg');
  this.load.image('shard','assets/shard.svg');
  this.load.image('shield','assets/shield.svg');
  this.load.image('sword','assets/sword.svg');
  this.load.image('compass','assets/compass.svg');
};

OverworldScene.prototype.create = function(){
  drawCheckerboard(this);
  this.player = this.physics.add.image(320,240,'player').setCollideWorldBounds(true);
  this.cursors = this.input.keyboard.createCursorKeys();
  this.keyE    = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

  // remaining shards
  this.shardsGroup = this.physics.add.staticGroup();
  const toSpawn = Math.max(0, 7 - state.shards);
  for(let i=0;i<toSpawn;i++){
    const x = Phaser.Math.Snap.To(Phaser.Math.Between(24, 640-24), 16);
    const y = Phaser.Math.Snap.To(Phaser.Math.Between(24, 480-24), 16);
    this.shardsGroup.create(x,y,'shard');
  }
  this.physics.add.overlap(this.player, this.shardsGroup, (_p, s)=>{
    s.destroy(); state.shards++; hud.shards.textContent=state.shards; save();
    if(state.shards===1 && !state.path){ hud.modal.style.display='flex'; }
  });

  // portals
  this.turtlePortal = makePortal(this, 600, 440, 'E: Turtle Shrine');
  this.rabbitPortal = makePortal(this,  40, 440, 'E: Rabbit Shrine');
  this.owlPortal    = makePortal(this, 320,  32, 'E: Owl Shrine');

  // HUD refresh
  if (hud.shield)  hud.shield.textContent  = state.hasShield  ? '✓' : '—';
  if (hud.sword)   hud.sword.textContent   = state.hasSword   ? '✓' : '—';
  if (hud.compass) hud.compass.textContent = state.hasCompass ? '✓' : '—';

  // cycles
  this.time.addEvent({
    delay:5000, loop:true, callback:()=>{
      state.cycles++; hud.cycles.textContent=state.cycles; save();
      if(state.path==='Pure'  && state.cycles===300) alert('Pure KYC unlocked (full reveal).');
      if(state.path==='Haste' && state.cycles===500) alert('Haste rite reached (80% reveal + 20% burn).');
    }
  });
};

OverworldScene.prototype.update = function(){
  const v=140; const d = dirInput(this);
  this.player.setVelocity(0);
  if(d.left && !d.right)  this.player.setVelocityX(-v);
  else if(d.right && !d.left) this.player.setVelocityX(v);
  if(d.up && !d.down)     this.player.setVelocityY(-v);
  else if(d.down && !d.up)    this.player.setVelocityY(v);

  if (Phaser.Math.Distance.Between(this.player.x,this.player.y,600,440) < 24 && Phaser.Input.Keyboard.JustDown(this.keyE)){
    state.lastScene='overworld'; save(); this.scene.start('turtle');
  }
  if (Phaser.Math.Distance.Between(this.player.x,this.player.y,40,440) < 24 && Phaser.Input.Keyboard.JustDown(this.keyE)){
    state.lastScene='overworld'; save(); this.scene.start('rabbit');
  }
  if (Phaser.Math.Distance.Between(this.player.x,this.player.y,320,32) < 24 && Phaser.Input.Keyboard.JustDown(this.keyE)){
    state.lastScene='overworld'; save(); this.scene.start('owl');
  }
};

// ---------- Turtle Shrine (Shield) ----------
function TurtleShrineScene(){ Phaser.Scene.call(this,{key:'turtle'}); }
TurtleShrineScene.prototype = Object.create(Phaser.Scene.prototype);
TurtleShrineScene.prototype.constructor = TurtleShrineScene;

TurtleShrineScene.prototype.preload = function(){
  this.load.image('player','assets/player.svg');
  this.load.image('shield','assets/shield.svg');
};

TurtleShrineScene.prototype.create = function(){
  drawCheckerboard(this);
  this.add.text(12,10,'Turtle Shrine — Virtue',{fontFamily:'system-ui',fontSize:'12px',color:'#bfecee'});
  this.exit = makePortal(this, 32, 448, 'E: Exit');
  this.player = this.physics.add.image(48,440,'player').setCollideWorldBounds(true);
  this.cursors = this.input.keyboard.createCursorKeys();
  this.keyE    = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

  const glow = this.add.rectangle(320, 240, 16,16, 0x2ecc71, 0.35).setStrokeStyle(1,0x2ecc71);
  this.block = this.physics.add.image(400, 240, null).setDisplaySize(16,16).setTint(0x557a57);
  this.block.body.setCollideWorldBounds(true).setImmovable(false).setDrag(500,500).setMaxVelocity(160,160);
  this.chest = this.add.rectangle(320, 200, 16,12, 0xd4af37).setStrokeStyle(1,0x8a6e1a).setVisible(false);
  this.chestHint = this.add.text(300,182,'E: Claim Shield',{fontFamily:'system-ui',fontSize:'10px',color:'#e9e1c7'}).setVisible(false);

  this.solved = false;
  this.time.addEvent({ delay:100, loop:true, callback:()=>{
    const onTarget = Phaser.Math.Distance.Between(this.block.x,this.block.y,glow.x,glow.y) < 8;
    if(onTarget && !this.solved){ this.solved=true; this.chest.setVisible(true); this.chestHint.setVisible(true); }
  }});
};

TurtleShrineScene.prototype.update = function(){
  const v=140; const d = dirInput(this);
  this.player.setVelocity(0);
  if(d.left && !d.right) this.player.setVelocityX(-v);
  else if(d.right && !d.left) this.player.setVelocityX(v);
  if(d.up && !d.down) this.player.setVelocityY(-v);
  else if(d.down && !d.up) this.player.setVelocityY(v);

  // push block when close
  if (Phaser.Math.Distance.Between(this.player.x,this.player.y,this.block.x,this.block.y) < 20){
    this.block.body.velocity.x += (this.player.body.velocity.x||0)*0.6;
    this.block.body.velocity.y += (this.player.body.velocity.y||0)*0.6;
  }

  if (Phaser.Math.Distance.Between(this.player.x,this.player.y,32,448) < 24 && Phaser.Input.Keyboard.JustDown(this.keyE)){
    this.scene.start('overworld');
  }
  if (this.solved &&
      Phaser.Math.Distance.Between(this.player.x,this.player.y,this.chest.x,this.chest.y) < 20 &&
      Phaser.Input.Keyboard.JustDown(this.keyE)){
    if (!state.hasShield){
      state.hasShield = true; save();
      if (hud.shield) hud.shield.textContent = '✓';
      alert('Shield of Virtue acquired!');
    }
  }
};

// ---------- Rabbit Shrine (Sword) ----------
function RabbitShrineScene(){ Phaser.Scene.call(this,{key:'rabbit'}); }
RabbitShrineScene.prototype = Object.create(Phaser.Scene.prototype);
RabbitShrineScene.prototype.constructor = RabbitShrineScene;

RabbitShrineScene.prototype.preload = function(){
  this.load.image('player','assets/player.svg');
  this.load.image('sword','assets/sword.svg');
};

RabbitShrineScene.prototype.create = function(){
  drawCheckerboard(this);
  this.add.text(12,10,'Rabbit Shrine — Love (Timed Trial)',{fontFamily:'system-ui',fontSize:'12px',color:'#bfecee'});
  this.exit = makePortal(this, 608, 448, 'E: Exit');
  this.player = this.physics.add.image(600,440,'player').setCollideWorldBounds(true);
  this.cursors = this.input.keyboard.createCursorKeys();
  this.keyE    = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

  const mk = (x,y)=> this.add.rectangle(x,y,14,14,0xff66aa,0.35).setStrokeStyle(1,0xff66aa);
  this.beacons = [ mk(80,80), mk(560,120), mk(320,260) ];
  this.hit = [false,false,false];

  this.timeLeft = 20;
  this.timerText = this.add.text(540,10,`Time: ${this.timeLeft}s`,{fontFamily:'system-ui',fontSize:'12px',color:'#ffd4e6'});
  this.timeEvt = this.time.addEvent({ delay:1000, loop:true, callback:()=>{
    this.timeLeft--; this.timerText.setText(`Time: ${this.timeLeft}s`);
    if (this.timeLeft<=0 && !this.chest){ this.fail(); }
  }});

  this.chest = null; this.hint  = null;
};

RabbitShrineScene.prototype.update = function(){
  const v=160; const d = dirInput(this);
  this.player.setVelocity(0);
  if(d.left && !d.right)  this.player.setVelocityX(-v);
  else if(d.right && !d.left) this.player.setVelocityX(v);
  if(d.up && !d.down)     this.player.setVelocityY(-v);
  else if(d.down && !d.up)    this.player.setVelocityY(v);

  if (Phaser.Math.Distance.Between(this.player.x,this.player.y,608,448) < 24 && Phaser.Input.Keyboard.JustDown(this.keyE)){
    this.scene.start('overworld');
  }

  this.beacons.forEach((b,i)=>{
    if(!this.hit[i] && Phaser.Math.Distance.Between(this.player.x,this.player.y,b.x,b.y) < 14){
      this.hit[i]=true; b.setFillStyle(0x66ffcc,0.4).setStrokeStyle(1,0x66ffcc);
    }
  });

  if (!this.chest && this.hit.every(Boolean)){
    this.chest = this.add.rectangle(320, 200, 16,12, 0xd4af37).setStrokeStyle(1,0x8a6e1a);
    this.hint  = this.add.text(300,182,'E: Claim Sword',{fontFamily:'system-ui',fontSize:'10px',color:'#e9e1c7'});
  }

  if (this.chest &&
      Phaser.Math.Distance.Between(this.player.x,this.player.y,this.chest.x,this.chest.y) < 20 &&
      Phaser.Input.Keyboard.JustDown(this.keyE)){
    if (!state.hasSword){
      state.hasSword = true; save();
      if (hud.sword) hud.sword.textContent = '✓';
      alert('Sword of Compassion acquired!');
    }
  }
};

RabbitShrineScene.prototype.fail = function(){
  this.timeLeft = 20; this.hit = [false,false,false];
  this.beacons.forEach(b=> b.setFillStyle(0xff66aa,0.35).setStrokeStyle(1,0xff66aa));
  if (this.chest){ this.chest.destroy(); this.chest=null; }
  if (this.hint){ this.hint.destroy(); this.hint=null; }
  this.timerText.setText(`Time: ${this.timeLeft}s`);
};

// ---------- Owl Shrine (Compass / Fog-of-War) ----------
function OwlShrineScene(){ Phaser.Scene.call(this,{key:'owl'}); }
OwlShrineScene.prototype = Object.create(Phaser.Scene.prototype);
OwlShrineScene.prototype.constructor = OwlShrineScene;

OwlShrineScene.prototype.preload = function(){
  this.load.image('player','assets/player.svg');
  this.load.image('compass','assets/compass.svg');
};

OwlShrineScene.prototype.create = function(){
  // crude maze walls
  const g = this.add.graphics();
  g.fillStyle(0x0f1318,1).fillRect(0,0,640,480);
  const wall = this.add.graphics({fillStyle:{color:0x12161b}});
  const rects = [
    [16,16,608,16],[16,448,608,16],[16,16,16,448],[608,16,16,448], // border
    [120,80,400,16],[120,80,16,280],[120,344,320,16],[424,120,16,240],
    [200,160,250,16],[200,160,16,180],[216,324,220,16],[300,200,16,124],
  ];
  rects.forEach(([x,y,w,h])=> wall.fillRect(x,y,w,h));

  // player & input
  this.player = this.physics.add.image(40,440,'player').setCollideWorldBounds(true);
  this.cursors = this.input.keyboard.createCursorKeys();
  this.keyE    = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

  // fog-of-war mask
  this.fog = this.make.graphics({x:0,y:0, add:false});
  this.fog.fillStyle(0x000000, 0.85);
  this.maskTex = this.fog.createGeometryMask();
  this.maskTex.setInvertAlpha(true);
  wall.setMask(this.maskTex); // walls sit under fog; mask defines visible hole
  // also dim the background under fog
  g.setMask(this.maskTex);

  // pedestal (goal)
  this.pedestal = this.add.circle(600, 40, 8, 0x90caf9, 0.9);
  this.pedestalLabel = this.add.text(576,52,'E: Insight',{fontFamily:'system-ui',fontSize:'10px',color:'#bfecee'}).setAlpha(0.85);

  // exit portal (unmasked hint if compass is owned later)
  this.exit = this.add.text(300,456,'E: Exit →',{fontFamily:'system-ui',fontSize:'10px',color:'#bfecee'}).setAlpha(0.4);

  // vision radius (bigger if you already have Compass)
  this.vision = state.hasCompass ? 80 : 48;

  // timer glow pulse
  this.t = 0;
};

OwlShrineScene.prototype.update = function(){
  const v=140; const d = dirInput(this);
  this.player.setVelocity(0);
  if(d.left && !d.right)  this.player.setVelocityX(-v);
  else if(d.right && !d.left) this.player.setVelocityX(v);
  if(d.up && !d.down)     this.player.setVelocityY(-v);
  else if(d.down && !d.up)    this.player.setVelocityY(v);

  // update fog hole
  this.t += 0.02;
  const flicker = Math.sin(this.t)*2;
  this.fog.clear();
  this.fog.fillStyle(0x000000, 0.93);
  this.fog.fillRect(0,0,640,480);
  this.fog.fillStyle(0xffffff, 1);
  this.fog.beginPath();
  this.fog.arc(this.player.x, this.player.y, this.vision + flicker, 0, Math.PI*2);
  this.fog.fill();
  
  // exit back
  if (Phaser.Math.Distance.Between(this.player.x,this.player.y,320,464) < 20 &&
      Phaser.Input.Keyboard.JustDown(this.keyE)){
    this.scene.start('overworld');
  }

  // claim compass at pedestal
  if (Phaser.Math.Distance.Between(this.player.x,this.player.y,600,40) < 18 &&
      Phaser.Input.Keyboard.JustDown(this.keyE)){
    if (!state.hasCompass){
      state.hasCompass = true; save();
      if (hud.compass) hud.compass.textContent = '✓';
      alert('Compass of Insight acquired!');
      // widen vision immediately
      this.vision = 80;
      // make exit hint brighter now that you “see”
      this.exit.setAlpha(0.9);
    }
  }
};
