import College from '../models/college.js';

// Get college names for datalist
export const getCollegeNames = async (req, res) => {
  try {
    const colleges = await College.find({})
      .select('name -_id')
      .limit(100)
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: colleges.map(c => c.name)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching college names',
      error: error.message
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
        message: 'College name is required'
      });
    }

    const newCollege = new College({ name });
    await newCollege.save();

    res.status(201).json({
      success: true,
      message: 'College name added successfully'
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'College name already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error adding college name',
      error: error.message
    });
  }
};