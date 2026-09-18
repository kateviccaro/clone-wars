(function () {
  'use strict';

  function drawBackground(ctx, width, height, time) {
    ctx.save();

    const sky = ctx.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, '#f07b68');
    sky.addColorStop(0.46, '#ffb36b');
    sky.addColorStop(0.72, '#ffd28a');
    sky.addColorStop(1, '#8dc5bd');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, height);

    const sunX = width * 0.72;
    const sunY = height * 0.3;
    ctx.fillStyle = 'rgba(255, 241, 177, 0.9)';
    ctx.beginPath();
    ctx.arc(sunX, sunY, Math.max(20, width * 0.095), 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#e56869';
    ctx.beginPath();
    ctx.moveTo(0, height * 0.63);
    ctx.lineTo(width * 0.14, height * 0.54);
    ctx.lineTo(width * 0.27, height * 0.62);
    ctx.lineTo(width * 0.43, height * 0.49);
    ctx.lineTo(width * 0.59, height * 0.61);
    ctx.lineTo(width * 0.76, height * 0.52);
    ctx.lineTo(width, height * 0.62);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#7b5762';
    ctx.beginPath();
    ctx.moveTo(0, height * 0.71);
    ctx.lineTo(width * 0.18, height * 0.63);
    ctx.lineTo(width * 0.34, height * 0.7);
    ctx.lineTo(width * 0.52, height * 0.6);
    ctx.lineTo(width * 0.69, height * 0.7);
    ctx.lineTo(width * 0.84, height * 0.63);
    ctx.lineTo(width, height * 0.7);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();

    // A few broad drifting clouds make the sunset feel alive, while time=0
    // still draws a complete scene.
    const drift = ((time || 0) * 7) % (width + 90);
    ctx.fillStyle = 'rgba(255, 221, 183, 0.34)';
    for (let i = 0; i < 3; i += 1) {
      const cloudX = ((i * width * 0.47 + drift) % (width + 100)) - 50;
      const cloudY = height * (0.18 + i * 0.09);
      ctx.beginPath();
      ctx.ellipse(cloudX, cloudY, width * 0.13, height * 0.018, 0, 0, Math.PI * 2);
      ctx.ellipse(cloudX + width * 0.1, cloudY + 2, width * 0.1, height * 0.014, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  function drawGround(ctx, width, height, groundHeight, offset) {
    ctx.save();
    const top = height - groundHeight;
    ctx.fillStyle = '#e7b66d';
    ctx.fillRect(0, top, width, groundHeight);

    ctx.fillStyle = '#f7d696';
    ctx.fillRect(0, top, width, Math.max(7, groundHeight * 0.16));

    const stripe = 34;
    const slide = ((offset || 0) % stripe + stripe) % stripe;
    ctx.fillStyle = 'rgba(133, 84, 65, 0.28)';
    for (let x = -stripe - slide; x < width + stripe; x += stripe) {
      ctx.fillRect(x, top + groundHeight * 0.38, stripe * 0.55, 4);
      ctx.fillRect(x + stripe * 0.22, top + groundHeight * 0.72, stripe * 0.28, 3);
    }

    ctx.strokeStyle = '#503c4a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, top + 1.5);
    ctx.lineTo(width, top + 1.5);
    ctx.stroke();
    ctx.restore();
  }

  function drawBird(ctx, x, y, size, velocity) {
    ctx.save();
    const tilt = Math.max(-0.28, Math.min(0.32, velocity / 1250));
    ctx.translate(x, y);
    ctx.rotate(tilt);

    const s = size / 34;
    ctx.scale(s, s);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#493b4a';
    ctx.lineWidth = 2.5;

    // White seagull body and head.
    ctx.fillStyle = '#fff8ed';
    ctx.beginPath();
    ctx.ellipse(0, 1, 14, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(9, -7, 7.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Folded wing, with a soft gray underside.
    ctx.fillStyle = '#b8cbd0';
    ctx.beginPath();
    ctx.moveTo(-10, -1);
    ctx.quadraticCurveTo(-1, -12, 10, -4);
    ctx.quadraticCurveTo(2, 2, -8, 5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#e4a548';
    ctx.beginPath();
    ctx.moveTo(15, -6);
    ctx.lineTo(23, -3);
    ctx.lineTo(15, -1);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#493b4a';
    ctx.beginPath();
    ctx.arc(11, -9, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawPipe(ctx, x, gapTop, gapBottom, pipeWidth, height) {
    ctx.save();
    const outline = '#3e3543';
    const trunk = '#3f8a69';
    const light = '#7fc58a';
    const sand = '#d89b58';

    function palmRect(y, rectHeight, topCap) {
      if (rectHeight <= 0) return;
      ctx.fillStyle = trunk;
      ctx.strokeStyle = outline;
      ctx.lineWidth = 3;
      ctx.fillRect(x, y, pipeWidth, rectHeight);
      ctx.strokeRect(x + 1.5, y + 1.5, Math.max(0, pipeWidth - 3), Math.max(0, rectHeight - 3));

      ctx.save();
      ctx.beginPath();
      ctx.rect(x + 3, y + 3, Math.max(0, pipeWidth - 6), Math.max(0, rectHeight - 6));
      ctx.clip();
      ctx.fillStyle = light;
      for (let stripeY = y + (topCap ? 12 : 8); stripeY < y + rectHeight; stripeY += 22) {
        ctx.fillRect(x + pipeWidth * 0.18, stripeY, pipeWidth * 0.64, 5);
      }
      ctx.restore();

      // Fronds stay within the obstacle rectangle and point toward the gap.
      const crownY = topCap ? y + rectHeight - 2 : y + 2;
      const direction = topCap ? 1 : -1;
      ctx.fillStyle = sand;
      ctx.strokeStyle = outline;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(x + pipeWidth * 0.5, crownY);
      ctx.lineTo(x + pipeWidth * 0.12, crownY - direction * 10);
      ctx.lineTo(x + pipeWidth * 0.35, crownY - direction * 5);
      ctx.lineTo(x + pipeWidth * 0.5, crownY - direction * 15);
      ctx.lineTo(x + pipeWidth * 0.65, crownY - direction * 5);
      ctx.lineTo(x + pipeWidth * 0.88, crownY - direction * 10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    palmRect(0, gapTop, true);
    palmRect(gapBottom, height - gapBottom, false);
    ctx.restore();
  }

  window.SPRITES = {
    drawBackground: drawBackground,
    drawGround: drawGround,
    drawBird: drawBird,
    drawPipe: drawPipe
  };
})();
