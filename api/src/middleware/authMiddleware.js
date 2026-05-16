import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'rahasia-kredit-123';

export const verifyToken = (req, res, next) => {
  const authHeader = req.header('Authorization');
  const token = authHeader ? authHeader.split(' ')[1] : null;
  if (!token) return res.status(401).json({ error: "Akses Ditolak." });

  try {
    const verified = jwt.verify(token, SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(401).json({ error: "Token tidak valid." });
  }
};

export const isOwner = (req, res, next) => {
  if (req.user.role !== 'OWNER') return res.status(403).json({ error: "Khusus Owner." });
  next();
};

export const isStaff = (req, res, next) => {
  if (req.user.role === 'DEBITUR') return res.status(403).json({ error: "Akses Ditolak." });
  next();
};