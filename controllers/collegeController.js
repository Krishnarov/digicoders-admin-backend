import College from "../models/college.js";

// Get college names for datalist
export const getCollegeNames = async (req, res) => {
  try {
    const colleges = await College.find();

    return res.status(200).json({
      success: true,
      colleges,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching college names",
      error: error.message,
    });
  }
};

// Add new college name
export const addCollegeName = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "College name is required",
      });
    }

    const newCollege = await College.create({ name: name });

    res.status(201).json({
      success: true,
      message: "College name added successfully",
      newCollege,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "College name already exists",
      });
    }
    res.status(500).json({
      success: false,
      message: "Error adding college name",
      error: error.message,
    });
  }
};
export const updataCollage = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive, name } = req.body;
    
    if (!id) return res.status(400).json({ message: "id is requrid" });
    const collage = await College.findById(id);
    if (!collage)
      return res.status(404).json({ message: "collage data is not found" });
    if (name) collage.name = name;
    if (typeof isActive !== "undefined") collage.isActive = isActive;
    await collage.save();
    return res
      .status(200)
      .json({ message: "updata succesfull", data: collage });
  } catch (error) {
    res.status(500).json({ message: "Error updateing college detels" });
  }
};

export const deleteCollage=async (req,res) => {
  try {
    const collage= await College.findByIdAndDelete(req.params.id)
    if(!collage) return res.status(404).json({message:"data not found"})
      return res.status(200).json({message:"data deleted successfull"})
  } catch (error) {
    res.status(500).json({message:"Error deleteing college detels",error})
  }
}