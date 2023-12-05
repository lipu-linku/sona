PROJDIR=.
INDIR=.
OUTDIR=.

init: ${INDIR}/nimi_pu.txt ${INDIR}/nimi_pi_pu_ala.txt ${INDIR}/compounds.txt ${INDIR}/data.json
process: ${OUTDIR}/nimi.json

${INDIR}/nimi_pu.txt:
	curl -s https://tokipona.org/nimi_pu.txt > ${INDIR}/nimi_pu.txt
${INDIR}/nimi_pi_pu_ala.txt:
	curl -s https://tokipona.org/nimi_pi_pu_ala.txt > ${INDIR}/nimi_pi_pu_ala.txt
${INDIR}/compounds.txt:
	curl -s https://tokipona.org/compounds.txt > ${INDIR}/compounds.txt
${INDIR}/data.json:
	curl -s https://linku.la/jasima/data.json > ${INDIR}/data.json

${OUTDIR}/nimi.json: ${PROJDIR}/jsonify_nimi.py ${INDIR}/nimi_pu.txt ${INDIR}/nimi_pi_pu_ala.txt
	python ${PROJDIR}/jsonify_nimi.py | jq > ${OUTDIR}/nimi.json
