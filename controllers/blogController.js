import Blog from "../models/Blog.js";
import dotenv from "dotenv";
dotenv.config();

export const createBlog = async (req, res) => {

    try {

        const { title, content, categories } = req.body;

        const blog = await Blog.create({
            title,
            content,
            categories,
            image: req.file?.path,
            author: req.user.id
        });

        res.json({
            message: "Blog created. Waiting for admin approval",
            blog
        });

    } catch (err) {
        console.log(err);

        res.status(500).json({
            message: "Error creating blog"
        });

    }

}

// import { sendEmail } from "../utils/sendEmail.js";

// export const createBlog = async (req, res) => {

//     try {

//         const { title, content, categories } = req.body;

//         const blog = await Blog.create({
//             title,
//             content,
//             categories,
//             image: req.file?.path,
//             author: req.user.id,
//             isPublished: false // 🔥 important
//         });

//         // 🔥 SEND EMAIL TO ADMIN
//         await sendEmail({
//             to: process.env.SMTP_USER,
//             subject: "📝 New Blog Pending Approval",
//             html: `
// <div style="font-family: Arial, sans-serif; background:#f4f6f8; padding:20px;">

//   <div style="max-width:600px; margin:auto; background:white; border-radius:10px; overflow:hidden; box-shadow:0 4px 10px rgba(0,0,0,0.05);">

//     <!-- Header -->
//     <div style="background:linear-gradient(90deg,#22c55e,#2563eb); padding:20px; text-align:center;">
//       <h1 style="color:white; margin:0;">DevNotes</h1>
//       <p style="color:#e0f2fe; margin:5px 0 0;">New Blog Submission</p>
//     </div>

//     <!-- Body -->
//     <div style="padding:20px; color:#333;">

//       <h2 style="margin-top:0;">📢 A New Blog is Waiting for Approval</h2>

//       <p style="font-size:14px;">
//         A user has submitted a new blog on <strong>DevNotes</strong>.
//         Please review the details below and take action.
//       </p>

//       <!-- Blog Details Box -->
//       <div style="background:#f9fafb; padding:15px; border-radius:8px; margin:15px 0;">
//         <p><strong>📝 Title:</strong> ${title}</p>
//         <p><strong>👤 Author:</strong> ${req.user.name}</p>
//         <p><strong>📅 Date:</strong> ${new Date().toLocaleString()}</p>
//       </div>

//       <!-- CTA Button -->
//       <div style="text-align:center; margin:25px 0;">
//         <a href="http://localhost:5173/admin"
//            style="background:#2563eb; color:white; padding:12px 20px; border-radius:6px; text-decoration:none; font-weight:bold;">
//           Review Blog
//         </a>
//       </div>

//       <p style="font-size:13px; color:#666;">
//         Please review and approve or reject the blog from the admin panel.
//       </p>

//     </div>

//     <!-- Footer -->
//     <div style="background:#f1f5f9; padding:15px; text-align:center; font-size:12px; color:#666;">
//       <p style="margin:0;">© ${new Date().getFullYear()} DevNotes</p>
//       <p style="margin:5px 0 0;">Built for developers 🚀</p>
//     </div>

//   </div>

// </div>
// `
//         });

//         res.json({
//             message: "Blog created. Waiting for admin approval",
//             blog
//         });

//     } catch (err) {
//         console.log(err);

//         res.status(500).json({
//             message: "Error creating blog"
//         });
//     }
// };


// export const deleteBlog = async (req, res) => {

//     const blog = await Blog.findById(req.params.id);

//     if (blog.author.toString() !== req.user.id) {
//         return res.status(403).json({
//             message: "Not allowed"
//         });
//     }

//     await blog.deleteOne();

//     res.json({
//         message: "Blog deleted"
//     });

// }


// export const deleteBlog = async (req, res) => {

//     const blog = await Blog.findById(req.params.id);

//     if (!blog) {
//         return res.status(404).json({
//             message: "Blog not found"
//         });
//     }

//     // Author OR Admin can delete
//     if (
//         blog.author.toString() !== req.user.id &&
//         req.user.role !== "admin"
//     ) {
//         return res.status(403).json({
//             message: "Not allowed"
//         });
//     }

//     await blog.deleteOne();

//     res.json({
//         message: "Blog deleted"
//     });
// };

export const getAllBlogs = async (req, res) => {

    const blogs = await Blog.find()
        .populate("author", "name email")
        .sort({ createdAt: -1 });

    res.json(blogs);
};


export const publishBlog = async (req, res) => {

    const blog = await Blog.findById(req.params.id);

    blog.isPublished = true;

    await blog.save();

    res.json({
        message: "Blog published"
    });

}


// export const getPublishedBlogs = async (req, res) => {

//     const blogs = await Blog.find({
//         isPublished: true
//     }).populate("author", "name");

//     res.json(blogs);

// }


export const getPublishedBlogs = async (req, res) => {

    const blogs = await Blog.find({
     
        isPublished: true
    })
        .populate("author", "name")
        .sort({ createdAt: -1 }); // 🔥 latest first

    res.json(blogs);

};


// export const getPublishedBlogs = async (req, res) => {

//     try {

//         const q = req.query.q || ""; // 🔥 fix

//         const blogs = await Blog.find({
//             $or: [
//                 { title: { $regex: q, $options: "i" } },
//                 { categories: { $regex: q, $options: "i" } }
//             ],
//             isPublished: true
//         })
//             .populate("author", "name")
//             .sort({ createdAt: -1 });

//         res.json({ blogs });

//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }

// };
// export const getRelatedBlogs = async (req, res) => {

//     const blog = await Blog.findById(req.params.id);

//     const relatedBlogs = await Blog.find({
//         categories: { $in: blog.categories },
//         _id: { $ne: blog._id },
//         isPublished: true
//     }).limit(5);

//     res.json(relatedBlogs);

// }


export const toggleLikeBlog = async (req, res) => {

    try {

        const blog = await Blog.findById(req.params.id);

        const userId = req.user.id;

        // ❌ author cannot like own blog
        if (blog.author.toString() === userId) {
            return res.status(400).json({
                message: "You cannot like your own blog"
            });
        }

        // const alreadyLiked = blog.likes.includes(userId);
        const alreadyLiked = blog.likes.some(
            (id) => id.toString() === userId
        );

        if (alreadyLiked) {
            blog.likes.pull(userId);
        } else {
            blog.likes.push(userId);
        }

        await blog.save();

        res.json({
            message: "Like updated",
            likes: blog.likes.length
        });

    } catch (err) {

        res.status(500).json({
            message: "Error liking blog"
        });

    }

}


export const getSingleBlog = async (req, res) => {

    const blog = await Blog.findById(req.params.id)
        .populate("author", "name");

    res.json(blog);
};



export const getRelatedBlogs = async (req, res) => {

    try {

        const blog = await Blog.findById(req.params.id);

        const related = await Blog.find({
            _id: { $ne: blog._id },
            categories: { $in: blog.categories },
            isPublished: true
        })
            .limit(3)
            .populate("author", "name");

        res.json(related);

    } catch (err) {

        res.status(500).json({
            message: "Error fetching related blogs"
        });

    }

}


export const getAllBlogsAdmin = async (req, res) => {

    try {

        const blogs = await Blog.find()
            .populate("author", "name")
            .sort({ createdAt: -1 });

        res.json(blogs);

    } catch (err) {

        res.status(500).json({
            message: "Error fetching blogs"
        });

    }

};


export const getSingleBlogAdmin = async (req, res) => {

    try {

        const blog = await Blog.findById(req.params.id)
            .populate("author", "name email");

        if (!blog) {
            return res.status(404).json({
                message: "Blog not found"
            });
        }

        res.json(blog);

    } catch (err) {

        res.status(500).json({
            message: "Error fetching blog"
        });

    }

};


export const getMyBlogs = async (req, res) => {
    const blogs = await Blog.find({ author: req.user.id });
    res.json(blogs);
};


export const updateBlog = async (req, res) => {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
        return res.status(404).json({ message: "Not found" });
    }

    if (blog.author.toString() !== req.user.id.toString()) {
        return res.status(403).json({ message: "Not allowed" });
    }

    blog.title = req.body.title || blog.title;
    blog.content = req.body.content || blog.content;

    // 🔥 important
    blog.isPublished = false;

    await blog.save();

    res.json(blog);
};


export const deleteBlog = async (req, res) => {
    const blog = await Blog.findById(req.params.id);

    if (!blog) return res.status(404).json({ message: "Not found" });

    if (
        blog.author.toString() !== req.user.id.toString() &&
        req.user.role !== "admin"
    ) {
        return res.status(403).json({ message: "Not allowed" });
    }

    await blog.deleteOne();

    res.json({ message: "Deleted" });
};



export const getBlogsByCategory = async (req, res) => {
    try {

        const { category } = req.params;

        const blogs = await Blog.find({
            categories: category,
            isPublished: true
        })
            .populate("author", "name")
            .sort({ createdAt: -1 });

        res.json(blogs);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};



// GET /api/blog/:id

export const getSingleBlogViews = async (req, res) => {

  const blog = await Blog.findByIdAndUpdate(
    req.params.id,
    { $inc: { views: 1 } }, // 🔥 increment
    { new: true }
  ).populate("author", "name");

  res.json({ blog });

};