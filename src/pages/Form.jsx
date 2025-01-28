import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { GiLotus, GiPeaceDove, GiMusicalNotes } from 'react-icons/gi';

const DanceForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    danceStyle: '',
    experienceLevel: '',
    learningGoals: [],
    preferredPracticeTime: '',
    age: '',
    physicalConditions: '',
    previousTraining: '',
    preferredLanguage: '',
    practiceFrequency: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleGoalsChange = (goal) => {
    setFormData(prevState => ({
      ...prevState,
      learningGoals: prevState.learningGoals.includes(goal)
        ? prevState.learningGoals.filter(g => g !== goal)
        : [...prevState.learningGoals, goal]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No authenticated user found');
      }

      await setDoc(doc(db, 'users', user.uid), {
        danceProfile: formData,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving dance profile:', error);
      setError('Failed to save profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const danceStyles = [
    'Bharatanatyam',
    'Kathak',
    'Odissi',
    'Kuchipudi',
    'Kathakali',
    'Manipuri',
    'Mohiniyattam',
    'Sattriya'
  ];

  const experienceLevels = [
    'Beginner (No prior experience)',
    'Novice (Some basic knowledge)',
    'Intermediate (1-3 years experience)',
    'Advanced (3+ years experience)',
    'Professional'
  ];

  const learningGoals = [
    'Master Basic Techniques',
    'Learn Advanced Mudras',
    'Perform on Stage',
    'Understand Cultural Context',
    'Teach Others',
    'Personal Fitness',
    'Spiritual Growth'
  ];

  const practiceFrequencies = [
    'Daily',
    '3-4 times per week',
    '1-2 times per week',
    'Weekends only',
    'Flexible schedule'
  ];

  const languages = [
    'English',
    'Hindi',
    'Tamil',
    'Telugu',
    'Sanskrit',
    'Malayalam',
    'Kannada',
    'Bengali'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="card bg-white shadow-xl">
            <div className="card-body">
              <div className="flex items-center gap-3 mb-6">
                <GiLotus className="w-8 h-8 text-orange-600" />
                <div>
                  <h2 className="text-2xl font-bold text-orange-900">Complete Your Dance Profile</h2>
                  <p className="text-orange-700">Help us personalize your learning journey</p>
                </div>
              </div>

              {error && (
                <div className="alert alert-error mb-6">
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Classical Dance Style</span>
                  </label>
                  <select
                    name="danceStyle"
                    value={formData.danceStyle}
                    onChange={handleInputChange}
                    className="select select-bordered"
                    required
                  >
                    <option value="">Select Dance Style</option>
                    {danceStyles.map(style => (
                      <option key={style} value={style}>{style}</option>
                    ))}
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Experience Level</span>
                  </label>
                  <select
                    name="experienceLevel"
                    value={formData.experienceLevel}
                    onChange={handleInputChange}
                    className="select select-bordered"
                    required
                  >
                    <option value="">Select Level</option>
                    {experienceLevels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Learning Goals</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {learningGoals.map(goal => (
                      <label key={goal} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="checkbox checkbox-primary"
                          checked={formData.learningGoals.includes(goal)}
                          onChange={() => handleGoalsChange(goal)}
                        />
                        <span className="text-sm">{goal}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Age Group</span>
                    </label>
                    <select
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      className="select select-bordered"
                      required
                    >
                      <option value="">Select Age Group</option>
                      <option value="under-18">Under 18</option>
                      <option value="18-25">18-25</option>
                      <option value="26-35">26-35</option>
                      <option value="36-50">36-50</option>
                      <option value="above-50">Above 50</option>
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Practice Frequency</span>
                    </label>
                    <select
                      name="practiceFrequency"
                      value={formData.practiceFrequency}
                      onChange={handleInputChange}
                      className="select select-bordered"
                      required
                    >
                      <option value="">Select Frequency</option>
                      {practiceFrequencies.map(frequency => (
                        <option key={frequency} value={frequency}>{frequency}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Preferred Practice Time</span>
                  </label>
                  <select
                    name="preferredPracticeTime"
                    value={formData.preferredPracticeTime}
                    onChange={handleInputChange}
                    className="select select-bordered"
                    required
                  >
                    <option value="">Select Time</option>
                    <option value="early-morning">Early Morning (5 AM - 8 AM)</option>
                    <option value="morning">Morning (8 AM - 11 AM)</option>
                    <option value="afternoon">Afternoon (11 AM - 3 PM)</option>
                    <option value="evening">Evening (3 PM - 7 PM)</option>
                    <option value="night">Night (7 PM - 10 PM)</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Preferred Language</span>
                  </label>
                  <select
                    name="preferredLanguage"
                    value={formData.preferredLanguage}
                    onChange={handleInputChange}
                    className="select select-bordered"
                    required
                  >
                    <option value="">Select Language</option>
                    {languages.map(language => (
                      <option key={language} value={language}>{language}</option>
                    ))}
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Previous Training (if any)</span>
                  </label>
                  <textarea
                    name="previousTraining"
                    value={formData.previousTraining}
                    onChange={handleInputChange}
                    className="textarea textarea-bordered h-24"
                    placeholder="Tell us about any previous dance training or experience..."
                  ></textarea>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Physical Conditions or Limitations</span>
                  </label>
                  <textarea
                    name="physicalConditions"
                    value={formData.physicalConditions}
                    onChange={handleInputChange}
                    className="textarea textarea-bordered h-24"
                    placeholder="Any physical conditions we should be aware of to provide better guidance..."
                  ></textarea>
                </div>

                <div className="form-control mt-6">
                  <button 
                    type="submit" 
                    className={`btn bg-orange-600 hover:bg-orange-700 text-white ${isSubmitting ? 'loading' : ''}`}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Saving...' : 'Start Your Journey'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DanceForm; 