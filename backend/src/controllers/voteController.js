import * as voteService from "../services/voteService.js";

export async function saveVote(req, res, next) {
  try {
    const vote = await voteService.saveVote(req.userId, req.body);
    res.json({ vote });
  } catch (err) {
    next(err);
  }
}

export async function getVotes(req, res, next) {
  try {
    const votes = await voteService.getVotes(req.userId);
    res.json({ votes });
  } catch (err) {
    next(err);
  }
}
