/**
 * GloSmart Drawing Class LMS - Course Recommendation Service
 * Multi-factor personalized course recommendation engine.
 */

// 1. Calculate exact age in full years from Date of Birth
export const calculateAge = (dob) => {
  if (!dob) return null;
  const birthDate = new Date(dob);
  if (isNaN(birthDate.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age >= 0 ? age : 0;
};

// 2. Classify student into age-based category dynamically
export const getAgeCategory = (age) => {
  if (age === null || age === undefined || isNaN(age)) return 'All Ages';
  
  if (age <= 6) {
    return 'Pre-Junior'; // 4-6 years (and early learners)
  } else if (age >= 7 && age <= 9) {
    return 'Junior'; // 7-9 years
  } else if (age >= 10 && age <= 12) {
    return 'Senior'; // 10-12 years
  } else {
    return 'Special'; // Above 12 years
  }
};

// 3. Age category curriculum focus descriptions
export const getCategoryFocus = (category) => {
  switch (category) {
    case 'Pre-Junior':
      return [
        'Basic drawing',
        'Lines and shapes',
        'Coloring',
        'Simple objects',
        'Fun drawing activities',
        'Basic creativity exercises',
        'Beginner-level art activities'
      ];
    case 'Junior':
      return [
        'Drawing fundamentals',
        'Object drawing',
        'Nature drawing',
        'Cartoon drawing',
        'Coloring techniques',
        'Basic shading',
        'Character drawing',
        'Creative drawing'
      ];
    case 'Senior':
      return [
        'Advanced drawing fundamentals',
        'Shading',
        'Perspective',
        'Character drawing',
        'Landscape drawing',
        'Still life',
        'Anatomy basics',
        'Advanced coloring',
        'Creative composition'
      ];
    case 'Special':
      return [
        'Advanced drawing',
        'Portrait drawing',
        'Realistic drawing',
        'Digital art',
        'Advanced shading',
        'Perspective',
        'Anatomy',
        'Specialized art techniques',
        'Professional-level drawing skills'
      ];
    default:
      return ['General Drawing', 'Creative Art'];
  }
};

// 4. Recommendation Engine scoring algorithm
export const getPersonalizedRecommendations = (student, allCourses = []) => {
  if (!student) return { student: null, recommendations: [] };

  // Calculate dynamic age and age category from DOB or fallback age string
  let age = calculateAge(student.dob);
  if (age === null && student.age) {
    const parsedAge = parseInt(student.age, 10);
    if (!isNaN(parsedAge)) age = parsedAge;
  }

  const ageCategory = getAgeCategory(age);
  const studentSkill = (student.skillLevel || 'Beginner').toLowerCase();
  const studentExp = (student.drawingExperience || 'Beginner').toLowerCase();
  const studentInterests = (student.interests || []).map(i => i.toLowerCase().trim());
  const studentCategories = (student.preferredCategories || []).map(c => c.toLowerCase().trim());
  const studentGoals = (student.learningGoals || []).map(g => g.toLowerCase().trim());

  // Collect IDs of already enrolled or completed courses to exclude
  const enrolledIds = new Set();
  if (student.enrolledCourses && Array.isArray(student.enrolledCourses)) {
    student.enrolledCourses.forEach(ec => {
      if (ec.courseId) enrolledIds.add(ec.courseId.toString());
      if (ec._id) enrolledIds.add(ec._id.toString());
      if (ec.courseName) enrolledIds.add(ec.courseName.toLowerCase().trim());
    });
  }
  if (student.completedCourses && Array.isArray(student.completedCourses)) {
    student.completedCourses.forEach(cc => {
      if (typeof cc === 'string') enrolledIds.add(cc);
      else if (cc && cc._id) enrolledIds.add(cc._id.toString());
    });
  }

  // Filter only active courses and exclude already enrolled/completed
  const eligibleCourses = allCourses.filter(course => {
    if (course.status && course.status !== 'Active') return false;
    const courseIdStr = course._id ? course._id.toString() : '';
    const courseNameStr = (course.courseName || '').toLowerCase().trim();
    if (enrolledIds.has(courseIdStr) || enrolledIds.has(courseNameStr)) {
      return false;
    }
    return true;
  });

  const scoredRecommendations = eligibleCourses.map(course => {
    let score = 0;
    const reasons = [];

    const courseAgeGroups = (course.targetAgeGroups || ['All Ages']).map(ag => ag.trim());
    const courseSkill = (course.skillLevel || course.difficulty || 'Beginner').toLowerCase();
    const courseCategory = (course.drawingCategory || '').toLowerCase().trim();
    const courseInterests = (course.interests || []).map(i => i.toLowerCase().trim());
    const courseNameLower = (course.courseName || '').toLowerCase();
    const courseDescLower = (course.description || '').toLowerCase();

    // Factor 1: Age Group Match (+50 Points)
    const isAllAges = courseAgeGroups.includes('All Ages');
    const isDirectAgeGroupMatch = courseAgeGroups.includes(ageCategory);
    const isAgeRangeMatch = age !== null && age >= (course.minAge || 0) && age <= (course.maxAge || 100);

    if (isDirectAgeGroupMatch) {
      score += 50;
      reasons.push(`Recommended for ${ageCategory}`);
    } else if (isAgeRangeMatch) {
      score += 45;
      reasons.push(`Perfect for age ${age}`);
    } else if (isAllAges) {
      score += 35;
      reasons.push(`Suitable for All Ages`);
    } else {
      // Small penalty or partial match if out of age group
      score += 10;
    }

    // Factor 2: Interests & Drawing Category Match (+20 Points)
    let interestMatched = false;
    let matchedInterestName = '';

    for (const interest of studentInterests) {
      if (
        courseInterests.includes(interest) ||
        courseCategory.includes(interest) ||
        courseNameLower.includes(interest) ||
        courseDescLower.includes(interest)
      ) {
        score += 20;
        interestMatched = true;
        matchedInterestName = interest;
        break;
      }
    }

    if (!interestMatched) {
      for (const cat of studentCategories) {
        if (courseCategory.includes(cat) || courseNameLower.includes(cat)) {
          score += 15;
          interestMatched = true;
          matchedInterestName = cat;
          break;
        }
      }
    }

    if (interestMatched && matchedInterestName) {
      // Capitalize first letter of interest
      const formattedInterest = matchedInterestName.charAt(0).toUpperCase() + matchedInterestName.slice(1);
      reasons.push(`Matches your interest in ${formattedInterest}`);
    }

    // Factor 3: Skill Level Match (+15 Points)
    if (courseSkill === studentSkill) {
      score += 15;
      reasons.push(`Based on your ${studentSkill} skill level`);
    } else if (
      (studentSkill === 'intermediate' && courseSkill === 'beginner') ||
      (studentSkill === 'advanced' && courseSkill === 'intermediate')
    ) {
      score += 10; // Stepping stone or refresher
    }

    // Factor 4: Experience Level Match (+10 Points)
    if (courseSkill === studentExp) {
      score += 10;
    }

    // Factor 5: Learning Goal Match (+5 Points)
    for (const goal of studentGoals) {
      if (courseDescLower.includes(goal) || courseNameLower.includes(goal)) {
        score += 5;
        break;
      }
    }

    // Determine primary recommendation tag
    let primaryReason = reasons[0] || 'Popular drawing course';
    if (interestMatched && isDirectAgeGroupMatch) {
      primaryReason = `Matches your age (${ageCategory}) & interests`;
    } else if (isDirectAgeGroupMatch && studentSkill === 'beginner') {
      primaryReason = `Perfect for ${ageCategory} beginners`;
    }

    return {
      course,
      courseId: course._id,
      courseName: course.courseName,
      thumbnailImage: course.thumbnailImage,
      description: course.description,
      targetAgeGroups: course.targetAgeGroups || ['All Ages'],
      difficulty: course.difficulty || course.skillLevel || 'Beginner',
      drawingCategory: course.drawingCategory || 'General Drawing',
      duration: course.duration || '8 Weeks',
      lessonsCount: course.lessonsCount || 16,
      price: course.price || '₹3,999',
      rating: course.rating || 4.8,
      instructor: course.instructor || 'GloSmart Faculty',
      score: Math.min(score, 100),
      reason: primaryReason,
      reasonsList: reasons
    };
  });

  // Sort descending by recommendation score
  scoredRecommendations.sort((a, b) => b.score - a.score);

  return {
    student: {
      studentId: student._id,
      name: student.name,
      dob: student.dob,
      age: age,
      ageCategory: ageCategory,
      skillLevel: student.skillLevel || 'Beginner',
      drawingExperience: student.drawingExperience || 'Beginner',
      interests: student.interests || [],
      learningGoals: student.learningGoals || []
    },
    recommendations: scoredRecommendations
  };
};
