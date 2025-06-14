# Node.js app එක සඳහා base image එකක් ලෙස Node.js LTS (Long Term Support) version එකක් තෝරන්න.
# `slim` version එක සාමාන්‍යයෙන් කුඩා වන අතර අවශ්‍ය දේ පමණක් අඩංගු වේ.
FROM node:20-slim

# yt-dlp ස්ථාපනය කිරීමට අවශ්‍ය system dependencies (Python, pip) ස්ථාපනය කරන්න.
# apt-get update && apt-get install -y --no-install-recommends: packages update කරගෙන, install කරන packages වල dependencies install නොකර,
# install කිරීමෙන් image size එක අඩුකරගත හැක.
# && rm -rf /var/lib/apt/lists/*: cache එක delete කරන්න image size එක තවදුරටත් අඩුකරන්න.
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    git \
    ffmpeg \
    yt-dlp && \ 
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# (පැරණි RUN pip install yt-dlp line එක ඉවත් කරන ලදී)

# Application code එක සඳහා working directory එකක් සකසන්න.
WORKDIR /app

# package.json සහ package-lock.json (තිබේ නම්) copy කරන්න.
# මේවා මුලින්ම copy කිරීමෙන් Docker's layer caching භාවිතයෙන් build වේගවත් කළ හැක.
COPY package*.json ./

# Node.js dependencies ස්ථාපනය කරන්න.
RUN npm install --omit=dev

# ඉතිරි application code එක copy කරන්න.
COPY . .

# Environment variable එකක් ලෙස PORT එක Define කරන්න. Koyeb මෙය auto set කරයි.
# ඔබේ Node.js app එක process.env.PORT භාවිතා කරන නිසා මෙය අනිවාර්ය නොවේ,
# නමුත් Dockerfile එකේ මෙය තිබීම හොඳ පුරුද්දකි.
ENV PORT=${PORT:-3000}

# Application එක run වන port එක expose කරන්න (Koyeb මෙය auto detect කරයි).
EXPOSE 3000

# Application එක ආරම්භ කිරීමට විධානය සකසන්න.
CMD ["npm", "start"]