/* ===== 天空雲朵：不多的幾朵低多邊形白雲，繞著校園上空慢慢飄；夜晚自然變暗（用受光材質）===== */
const CLD = { list: [], t: 0, mat: new T.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.94 }) };
(function () {
  const rr2 = (() => { let s = 777; return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; })();
  const puff = () => {
    const parts = [], n = 5 + ((rr2() * 3) | 0);
    for (let i = 0; i < n; i++) { const u = (i - (n - 1) / 2) / n, r = 2.4 + rr2() * 1.6 - Math.abs(u) * 2.2; parts.push([new T.SphereGeometry(Math.max(1.5, r), 10, 7), hwM4(u * 8.5, Math.max(0, r - 2.4) * 0.5 + rr2() * 0.5, (rr2() - 0.5) * 2, 1, 0.78, 0.9)]); }
    return hwMerge(parts);
  };
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * 6.283 + rr2() * 0.6, d = 20 + rr2() * 110, m = new T.Mesh(puff(), CLD.mat); m.castShadow = false; m.userData.noOutline = true; m.frustumCulled = false; m.scale.setScalar(1 + rr2() * 0.7);
    scene.add(m); CLD.list.push({ m, x: PC.x + Math.cos(a) * d, z: PC.z + Math.sin(a) * d, y: 30 + rr2() * 16, sp: 0.5 + rr2() * 0.6, yaw: rr2() * 6 });
  }
})();
function cloudTick(dt) {
  CLD.t += dt;
  CLD.list.forEach(c => {
    c.x += c.sp * dt; if (c.x > PC.x + 140) c.x -= 280;
    sph(c.x, c.y, c.z, c.m.position); frameQuat(c.x, c.z, c.m.quaternion); _q1.setFromAxisAngle(_ey, c.yaw); c.m.quaternion.multiply(_q1);
  });
}
