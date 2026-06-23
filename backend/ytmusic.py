import sys
from ytmusicapi import YTMusic

def main():
    if len(sys.argv) < 2:
        return
    query = sys.argv[1]  # whole query as one argument
    yt = YTMusic()
    results = yt.search(query, filter='songs', limit=1)
    if results:
        vid = results[0].get('videoId')
        if vid:
            print(vid)

if __name__ == '__main__':
    main()