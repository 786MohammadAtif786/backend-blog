// controllers/commentController.js

import Comment from "../models/commentModel.js";


// ➕ Add Comment
// export const addComment = async (req, res) => {
//   try {
//     const { content } = req.body;
//     const { blogId } = req.params;

//     if (!content) {
//       return res.status(400).json({ message: "Comment required" });
//     }

//     const comment = await Comment.create({
//       content,
//       blog: blogId,
//       user: req.user.id, // login user
//     });

//     console.log(comment);
    

//     const populated = await comment.populate("user", "name");

//     res.status(201).json(populated);

//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };


export const addComment = async (req, res) => {
  try {
    const { content, parentComment } = req.body;
    const { blogId } = req.params;

    const comment = await Comment.create({
      content,
      blog: blogId,
      user: req.user.id,
      parentComment: parentComment || null,
    });

    const populated = await comment.populate("user", "name");

    res.status(201).json(populated);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const getComments = async (req, res) => {
  try {
    const { blogId } = req.params;

    const comments = await Comment.find({ blog: blogId })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    // 🔥 convert to tree
    const map = {};
    const roots = [];

    comments.forEach(c => {
      map[c.id] = { ...c._doc, replies: [] };
    });

    comments.forEach(c => {
      if (c.parentComment) {
        map[c.parentComment]?.replies.push(map[c.id]);
      } else {
        roots.push(map[c.id]);
      }
    });

    res.json(roots);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// // 📥 Get Comments
// export const getComments = async (req, res) => {
//   try {
//     const { blogId } = req.params;

//     const comments = await Comment.find({ blog: blogId })
//       .populate("user", "name")
//       .sort({ createdAt: -1 });

//     res.json(comments);

//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };


// // ❌ Delete Comment (optional)
// export const deleteComment = async (req, res) => {
//   try {
//     const comment = await Comment.findById(req.params.id);

//     if (!comment) {
//       return res.status(404).json({ message: "Not found" });
//     }

//     if (comment.user.toString() !== req.user._id.toString()) {
//       return res.status(403).json({ message: "Not allowed" });
//     }

//     await comment.deleteOne();

//     res.json({ message: "Deleted" });

//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };


// controllers/commentController.js

// import Comment from "../models/commentModel.js";

// ✏️ UPDATE COMMENT
export const updateComment = async (req, res) => {
  try {
    const { content } = req.body;

    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // ✅ Allow: owner OR admin
    if (
      comment.user.toString() !== req.user.id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not allowed" });
    }

    comment.content = content || comment.content;

    await comment.save();

    const updated = await comment.populate("user", "name");

    res.json(updated);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ❌ DELETE COMMENT
export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // ✅ Allow: owner OR admin
    if (
      comment.user.toString() !== req.user.id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await comment.deleteOne();

    res.json({ message: "Deleted successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};