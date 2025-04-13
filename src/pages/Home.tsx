import { Brain } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center mb-8">
        <Brain className="w-12 h-12 text-blue-600 mr-2" />
        <h1 className="text-4xl font-bold text-gray-900">HMS Brain Activity Monitor</h1>
      </div>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
        Real-time monitoring and classification of harmful brain activity patterns
        in critically ill patients using advanced EEG analysis.
      </p>
      <h2 className="text-2xl font-semibold mb-4">Project Overview</h2>
      <p className="text-gray-700 mb-8">
        The HMS Harmful Brain Activity Classification project focuses on detecting and classifying seizures and other patterns of harmful brain activity in critically ill patients using EEG data. This project aims to improve real-time monitoring and early diagnosis of neurological conditions. Accurate classification of brain activity can assist healthcare professionals in making timely interventions, reducing risks, and enhancing patient care.
      </p>
      <h2 className="text-2xl font-semibold mb-4">Team Members</h2>
      <table className="border-collapse border border-gray-300 w-full">
        <thead>
          <tr className="bg-gray-200">
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">USN</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="px-4 py-2">L Moryakantha</td>
            <td className="px-4 py-2">1RV24AI406</td>
          </tr>
          <tr>
            <td className="px-4 py-2">Shreyas Bharadwaj</td>
            <td className="px-4 py-2">1RV23AI096</td>
          </tr>
          <tr>
            <td className="px-4 py-2">Vijaykumar BK</td>
            <td className="px-4 py-2">1RV23AI118</td>
          </tr>
          <tr>
            <td className="px-4 py-2">Sankalp Khamesra</td>
            <td className="px-4 py-2">1RV23AI086</td>
          </tr>
        </tbody>
      </table>
      <h2 className="text-2xl font-semibold mt-12 mb-4">Project Statement</h2>
      <p className="text-gray-700 mb-8">
        We are making an AIML Project on this problem statement: Classify seizures and other patterns of harmful brain activity in critically ill patients. We are a team of 4 and are planning on developing a full-scale end-to-end full-stack real-time web app. We would appreciate any ideas on what we can do next to enhance our project. It should incorporate AI and ML aspects (model with cleaned preprocessed data, complete EDA process, selection of suitable algorithm and model building, prediction/classification should be obtained and demonstrated with visualizations) with Discrete Mathematical structures and combinatorics and design and analysis of algorithms.
      </p>
      <h2 className="text-2xl font-semibold mt-12 mb-4">Structured Approach</h2>
      <ol className="list-decimal ml-8 mb-8">
        <li>Data Collection & Preprocessing: Use open-source datasets like TUH EEG Seizure Corpus or CHB-MIT Scalp EEG Database.</li>
        <li>Exploratory Data Analysis (EDA): Perform statistical insights, visualization, and dimensionality reduction.</li>
        <li>Ai/ML Pipeline: Feature engineering, algorithm selection, model training & evaluation, and performance metrics.</li>
        <li>Real-time Monitoring Web App: Frontend development, backend setup, database integration, and WebSocket implementation.</li>
        <li>Discrete Mathematical Structures & Combinatorics: Apply graph theory, combinatorial optimization, recurrence relations, and generating functions.</li>
        <li>Design & Analysis of Algorithms: Utilize divide and conquer, dynamic programming, greedy algorithms, and computational complexity analysis.</li>
        <li>Deployment & Visualization: Model deployment, real-time alerts, and visualization tools.</li>
      </ol>
    </div>
  );
};

export default Home;