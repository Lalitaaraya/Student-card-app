BlazeFace model assets

To support offline and tracking-protection-resistant face detection, download the BlazeFace model artifacts and place them here under this directory.

Steps:
1. From a machine with internet access, fetch the tfjs BlazeFace model files. Example source:
   https://storage.googleapis.com/tfjs-models/savedmodel/blazeface/model.json
   and the associated shard files listed in model.json (e.g., group1-shard1of1.bin)

2. Save model.json and the shard .bin files into this folder so the files are served at:
   /models/blazeface/model.json
   /models/blazeface/group1-shard1of1.bin

3. The frontend will attempt to load the model from /models/blazeface/model.json first; if present, detection will work even when CDNs are blocked.

Privacy note: the model files are static assets and contain no user data. Keep them in the repo or in your deployment assets as needed.
