/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    config.cache = {
      type: 'filesystem',
    };
    return config;
  },
  images: {
	domains: ['res.cloudinary.com', 'scontent.fhan14-5.fna.fbcdn.net', 'content.pancake.vn'],
  },
};

export default nextConfig;
