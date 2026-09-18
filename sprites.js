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

    // Compact white seagull body and head. All local geometry stays within
    // the bird box even when the bird tilts during a climb or fall.
    ctx.fillStyle = '#fff8ed';
    ctx.beginPath();
    ctx.ellipse(-1, 1, 10.5, 8.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(7, -6, 6.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Folded wing, with a soft gray underside.
    ctx.fillStyle = '#b8cbd0';
    ctx.beginPath();
    ctx.moveTo(-9, 0);
    ctx.quadraticCurveTo(-1, -10, 8, -4);
    ctx.quadraticCurveTo(2, 2, -7, 5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#e4a548';
    ctx.beginPath();
    ctx.moveTo(12, -6);
    ctx.lineTo(14.5, -4);
    ctx.lineTo(12, -2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#493b4a';
    ctx.beginPath();
    ctx.arc(8.5, -7.5, 1.25, 0, Math.PI * 2);
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

      // The crown is a clear fan of palm fronds, clipped to the obstacle so
      // it never changes the collision rectangle or reaches into the gap.
      const crownY = topCap ? y + rectHeight - 2 : y + 2;
      const direction = topCap ? 1 : -1;
      const crownHeight = Math.min(26, Math.max(8, rectHeight - 4));
      ctx.save();
      ctx.beginPath();
      ctx.rect(x + 2, y + 2, Math.max(0, pipeWidth - 4), Math.max(0, rectHeight - 4));
      ctx.clip();
      ctx.fillStyle = light;
      ctx.fillRect(x + pipeWidth * 0.2, topCap ? y + 8 : y + rectHeight - 18, pipeWidth * 0.6, Math.max(0, rectHeight - 18));

      ctx.fillStyle = sand;
      ctx.strokeStyle = outline;
      ctx.lineWidth = 2;
      const hubX = x + pipeWidth * 0.5;
      const leafY = crownY - direction * Math.min(7, crownHeight * 0.25);
      const leaves = [
        [hubX - pipeWidth * 0.42, crownY - direction * crownHeight * 0.55],
        [hubX - pipeWidth * 0.24, crownY - direction * crownHeight * 0.82],
        [hubX, crownY - direction * crownHeight],
        [hubX + pipeWidth * 0.24, crownY - direction * crownHeight * 0.82],
        [hubX + pipeWidth * 0.42, crownY - direction * crownHeight * 0.55]
      ];
      for (const leaf of leaves) {
        ctx.beginPath();
        ctx.moveTo(hubX, leafY);
        ctx.quadraticCurveTo((hubX + leaf[0]) / 2, leaf[1] - direction * 3, leaf[0], leaf[1]);
        ctx.quadraticCurveTo((hubX + leaf[0]) / 2, leaf[1] + direction * 3, hubX, leafY + direction * 3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
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
